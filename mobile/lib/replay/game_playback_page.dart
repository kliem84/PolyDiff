import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:get/get.dart';
import 'package:mobile/constants/app_constants.dart';
import 'package:mobile/constants/app_routes.dart';
import 'package:mobile/constants/enums.dart';
import 'package:mobile/models/canvas_model.dart';
import 'package:mobile/models/game_record_model.dart';
import 'package:mobile/models/players.dart';
import 'package:mobile/providers/game_record_provider.dart';
import 'package:mobile/replay/game_event_playback_manager.dart';
import 'package:mobile/replay/game_event_slider.dart';
import 'package:mobile/replay/game_events_services.dart';
import 'package:mobile/replay/replay_canvas_widget.dart';
import 'package:mobile/replay/replay_images_provider.dart';
import 'package:mobile/replay/replay_player_provider.dart';
import 'package:mobile/services/info_service.dart';
import 'package:mobile/widgets/replay_pop_up_widget.dart';
import 'package:provider/provider.dart';

class GameEventPlaybackScreen extends StatefulWidget {
  static const String routeName = REPLAY_ROUTE;

  GameEventPlaybackScreen();

  static Route route() {
    return MaterialPageRoute(
      settings: const RouteSettings(name: routeName),
      builder: (_) => GameEventPlaybackScreen(),
    );
  }

  @override
  State<GameEventPlaybackScreen> createState() =>
      _GameEventPlaybackScreenState();
}

class _GameEventPlaybackScreenState extends State<GameEventPlaybackScreen> {
  late StreamSubscription<GameEventData> _subscription;
  late GameEventPlaybackService playbackService;
  late GameEventPlaybackManager playbackManager;
  late ReplayImagesProvider replayImagesProvider;
  late ReplayPlayerProvider replayPlayerProvider;
  late GameEventData gameEvent;
  late GameRecordProvider gameRecordProvider;
  bool isCheatActivated = false;
  bool isAnimationPaused = false;
  String formattedTime = "00:00";

  @override
  void initState() {
    super.initState();

    gameRecordProvider = Get.find();
    // Initialize services and providers
    playbackService = Get.find();
    replayImagesProvider = Get.find();
    replayPlayerProvider = Get.find();
    playbackManager = Get.find();
    replayPlayerProvider.setPlayersData(gameRecordProvider.record.players);
    formattedTime = calculateFormattedTime(playbackManager.timer);
    replayPlayerProvider
        .setNumberOfObservers(gameRecordProvider.record.observers);

    loadInitialCanvas();

    subscribeToEvents();
  }

  void loadInitialCanvas() async {
    try {
      await replayImagesProvider.loadInitialCanvas(gameRecordProvider.record);
    } catch (e) {
      print("Failed to load initial canvas: $e");

      showErrorDialog("Failed to load game data. Please try again.");
    }
  }

  void subscribeToEvents() {
    playbackService.startPlayback();
    _subscription = playbackService.eventsStream.listen((GameEventData event) {
      setState(() {
        gameEvent = event; // Update the current event
        if (event.gameEvent == GameEvents.EndGame.name) {
          print("****** End Game ******");
          _showReplayPopUp();
        } else {
          formattedTime = calculateFormattedTime(event.time!);
        }
        print("****** Set State from screen page ******");
      });
    }, onError: (error) {
      print("Error receiving game event: $error");
      showErrorDialog("An error occurred while processing game events.");
    });
  }

  void _showReplayPopUp() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return ReplayPopUp(
          endMessage: 'La partie est terminée',
          onGoHome: () {
            Navigator.pushNamed(context, DASHBOARD_ROUTE);
          },
          onReplay: () {
            Navigator.pushNamed(context, REPLAY_ROUTE);
          },
        );
      },
    );
  }

  void showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Error"),
          content: Text(message),
          actions: <Widget>[
            TextButton(
              child: Text("OK"),
              onPressed: () {
                Navigator.of(context).pop(); // Dismiss the dialog
              },
            ),
          ],
        );
      },
    );
  }

  String calculateFormattedTime(int timeInSeconds) {
    int elapsedTime =
        (gameRecordProvider.record.duration * 1000) - timeInSeconds;

    Duration duration = Duration(milliseconds: elapsedTime);

    if (elapsedTime.isNegative) {
      return "00:00";
    }
    int minutes = duration.inMinutes;
    int seconds = duration.inSeconds % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    // Providers
    final GameRecordProvider gameRecordProvider =
        context.read<GameRecordProvider>();

    final ReplayPlayerProvider replayPlayerProvider =
        context.watch<ReplayPlayerProvider>();
    final ReplayImagesProvider replayImagesProvider =
        context.watch<ReplayImagesProvider>();

    final GameEventPlaybackManager playbackManager =
        context.watch<GameEventPlaybackManager>();

    final InfoService infoService = context.watch<InfoService>();

    return Scaffold(
        body: Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(infoService.isThemeLight
                  ? GAME_BACKGROUND_PATH
                  : GAME_BACKGROUND_PATH_DARK),
              fit: BoxFit.cover,
            ),
          ),
        ),
        Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Row(
              children: [
                if (gameRecordProvider.record.isCheatEnabled) ...[
                  ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Color(0xFFEF6151),
                      backgroundColor: Color(0xFF2D1E16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18.0),
                      ),
                      padding:
                          EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                    ),
                    child: Text(
                      AppLocalizations.of(context)!.gamePage_cheatButton,
                      style: TextStyle(fontSize: 30),
                    ),
                  ),
                ] else
                  SizedBox(width: 120),
                SizedBox(
                  height: 200,
                  width: 1000,
                  child: _gameInfosReplay(),
                ),
              ],
            ),
            FutureBuilder<CanvasModel>(
              future: replayImagesProvider.currentCanvas,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.done &&
                    snapshot.hasData) {
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Expanded(
                        child: ReplayOriginalCanvas(snapshot.data!),
                      ),
                      SizedBox(width: 50),
                      Expanded(child: ReplayModifiedCanvas(snapshot.data!)),
                    ],
                  );
                } else if (snapshot.connectionState ==
                    ConnectionState.waiting) {
                  return CircularProgressIndicator();
                } else {
                  return Text("No data available");
                }
              },
            ),
          ],
        ),
        // if (isChatBoxVisible)
        //   Positioned(
        //     top: 50,
        //     left: 0,
        //     right: 0,
        //     height: 550,
        //     child: Align(
        //       alignment: Alignment.topCenter,
        //       child: AnimatedOpacity(
        //         opacity: 1.0,
        //         duration: Duration(milliseconds: 500),
        //         child: Transform.scale(
        //           scale: 1.0,
        //           child: ChatBox(),
        //         ),
        //       ),
        //     ),
        //   ),
        // isPlayerAnObserver
        //     ? _actionButton(
        //         context,
        //         AppLocalizations.of(context)!.gamePage_leaveButton,
        //         () {
        //           gameManagerService.abandonGame(lobbyService.lobby.lobbyId);
        //           Navigator.pushNamed(context, DASHBOARD_ROUTE);
        //         },
        //       )
        //     : _actionButton(
        //         context,
        //         AppLocalizations.of(context)!.gamePage_giveUpButton,
        //         () {
        //           Future.delayed(Duration.zero, () {
        //             if (ModalRoute.of(context)?.isCurrent ?? false) {
        //               showDialog(
        //                 barrierDismissible: false,
        //                 context: context,
        //                 builder: (BuildContext context) {
        //                   return AbandonPopup();
        //                 },
        //               );
        //             }
        //           });
        //         },
        //       ),
        // _observerInfos(replayPlayerProvider.nObservers),
        // Align(
        //   alignment: Alignment.bottomCenter,
        //   child: Padding(
        //     padding: const EdgeInsets.only(bottom: 20.0),
        //     child: IconButton(
        //       icon: Icon(Icons.chat),
        //       iconSize: 45.0,
        //       color: Colors.white,
        //       onPressed: () {
        //         setState(() {
        //           isChatBoxVisible = !isChatBoxVisible;
        //         });
        //       },
        //     ),
        //   ),
        // ),
        Positioned(
          left: 0.0,
          right: 0.0,
          bottom: 8.0,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              GameEventSlider(
                playbackService: playbackService,
                playbackManager: playbackManager,
              ),
            ],
          ),
        ),

        // Positioned(
        //   left: 0.0,
        //   right: 0.0,
        //   bottom: 8.0,
        //   child: Row(
        //     children: [
        // Directly place the GameEventSlider without any flex-related wrapper
        // GameEventSlider(
        //   playbackService: playbackService,
        //   playbackManager: playbackManager,
        // ),
        // // You can control the space between the slider and the observer info,
        // // for example using a SizedBox if necessary.
        // SizedBox(width: 8), // Adjust the width as needed
        _observerInfos(replayPlayerProvider.nObservers),
        //     ],
        //   ),
        // )
      ],
    ));
  }

  @override
  void dispose() {
    _subscription.cancel();
    replayImagesProvider.dispose();
    playbackManager.dispose();
    playbackService.dispose();
    gameRecordProvider.dispose();
    replayPlayerProvider.dispose();

    super.dispose();
  }

  TextStyle _textStyle() {
    return TextStyle(
      fontSize: 25,
      fontWeight: FontWeight.bold,
      color: Colors.black,
    );
  }

  Widget _observerInfos(int nObservers) {
    if (nObservers == 0) {
      return Positioned(
        right: 8.0,
        bottom: 8.0,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.5),
            borderRadius: BorderRadius.circular(15),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [Icon(Icons.visibility_off, color: Colors.white)],
          ),
        ),
      );
    }

    return Positioned(
      right: 8.0,
      bottom: 8.0,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.5),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.remove_red_eye, color: Colors.white),
            SizedBox(width: 8),
            Text(
              nObservers.toString(),
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _playerInfo(Player player) {
    return Row(
      children: [
        Icon(
          Icons.person,
          color: Colors.black,
          size: 30,
        ),
        Text(
          player.name!,
          style: _textStyle(),
          textAlign: TextAlign.center,
        ),
        SizedBox(
          width: 30,
        ),
        Text(
          '${AppLocalizations.of(context)!.gameInfos_differencesFoundTitle} : ${player.count}',
          style: _textStyle(),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _gameInfosReplay() {
    String formattedTime =
        "${(playbackManager.timer ~/ 60).toString().padLeft(2, '0')}:${(playbackManager.timer % 60).toString().padLeft(2, '0')}";
    String gameMode = AppLocalizations.of(context)!.classicMode;

    return SizedBox(
        width: 100,
        height: 50,
        child: Column(
          children: [
            SizedBox(height: 20),
            Row(
              children: [
                SizedBox(width: 380),
                Text(
                  '${AppLocalizations.of(context)!.gameInfos_gameModeTitle} : $gameMode',
                  style: _textStyle(),
                  textAlign: TextAlign.center,
                ),
                SizedBox(width: 100),
                Text(
                  '${AppLocalizations.of(context)!.gameInfos_timeTitle} : ${formattedTime}',
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
            Text(
              '${AppLocalizations.of(context)!.gameInfos_differencesPresentTitle} : ${gameRecordProvider.record.game.nDifferences}',
              style: _textStyle(),
              textAlign: TextAlign.center,
            ),
            Row(
              children: [
                if (gameRecordProvider.record.players.isNotEmpty) ...[
                  _playerInfo(replayPlayerProvider.getPlayer(0)),
                ],
                SizedBox(
                  width: 90,
                ),
                if (gameRecordProvider.record.players.length > 1) ...[
                  _playerInfo(replayPlayerProvider.getPlayer(1)),
                ],
              ],
            ),
            Row(
              children: [
                if (gameRecordProvider.record.players.length >= 3) ...[
                  _playerInfo(replayPlayerProvider.getPlayer(2)),
                ],
                if (gameRecordProvider.record.players.length >= 4) ...[
                  SizedBox(
                    width: 130,
                  ),
                  _playerInfo(replayPlayerProvider.getPlayer(3)),
                ],
              ],
            )
          ],
        ));
  }
}