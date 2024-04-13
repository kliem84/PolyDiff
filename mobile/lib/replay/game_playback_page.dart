import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:get/get.dart';
import 'package:mobile/constants/app_routes.dart';
import 'package:mobile/models/canvas_model.dart';
import 'package:mobile/models/game_record_model.dart';
import 'package:mobile/models/players.dart';
import 'package:mobile/replay/game_event_playback_manager.dart';
import 'package:mobile/replay/game_event_slider.dart';
import 'package:mobile/replay/game_events_services.dart';
import 'package:mobile/replay/replay_canvas_widget.dart';
import 'package:mobile/replay/replay_images_provider.dart';
import 'package:mobile/replay/replay_player_provider.dart';
import 'package:provider/provider.dart';

class GameEventPlaybackScreen extends StatefulWidget {
  static const String routeName = REPLAY_ROUTE;
  final GameRecord record;

  GameEventPlaybackScreen({required this.record});

  static Route route(GameRecord record) {
    return MaterialPageRoute(
      settings: const RouteSettings(name: routeName),
      builder: (_) => GameEventPlaybackScreen(record: record),
    );
  }

  @override
  State<GameEventPlaybackScreen> createState() =>
      _GameEventPlaybackScreenState();
}

class _GameEventPlaybackScreenState extends State<GameEventPlaybackScreen> {
  late GameEventPlaybackService playbackService;
  late GameEventPlaybackManager playbackManager;
  late ReplayImagesProvider replayImagesProvider;
  late ReplayPlayerProvider replayPlayerProvider;
  late GameEventData gameEvent;

  late Timer timer;
  String formattedTime = "00:00";

  @override
  void initState() {
    super.initState();

    // Initialize services and providers
    playbackService = GameEventPlaybackService(widget.record.gameEvents);
    playbackManager = GameEventPlaybackManager(playbackService);
    replayImagesProvider = Get.find();
    replayPlayerProvider = Get.find();
    replayPlayerProvider.setPlayersData(widget.record.players);

    loadInitialCanvas();

    setupPeriodicUpdates();

    subscribeToEvents();
  }

  void setupPeriodicUpdates() {
    timer = Timer.periodic(Duration(seconds: 1), (_) {
      setState(() {
        formattedTime = calculateFormattedTime(playbackService.lastEventTime ??
            DateTime.fromMillisecondsSinceEpoch(0));
      });
    });
  }

  void loadInitialCanvas() async {
    try {
      // Assuming loadInitialCanvas in ReplayImagesProvider takes GameRecord and returns Future<void>
      await replayImagesProvider.loadInitialCanvas(widget.record);
    } catch (e) {
      print("Failed to load initial canvas: $e");
      // Optionally, show an error message to the user or retry the loading
      showErrorDialog("Failed to load game data. Please try again.");
    }
  }

  void subscribeToEvents() {
    playbackService.eventsStream.listen((GameEventData event) {
      gameEvent = event;
    }, onError: (error) {
      print("Error receiving game event: $error");
      showErrorDialog("An error occurred while processing game events.");
    });
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

  String calculateFormattedTime(DateTime timestamp) {
    // Calculate elapsed time since the start of the playback
    Duration elapsedTime =
        timestamp.difference(playbackService.events.first.timestamp);
    // Calculate minutes and seconds from the elapsed time
    int minutes = elapsedTime.inMinutes;
    int seconds = elapsedTime.inSeconds % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    String gameMode = AppLocalizations.of(context)!.classicMode;

    // Providers
    final ReplayPlayerProvider replayPlayerProvider =
        context.watch<ReplayPlayerProvider>();

    ReplayImagesProvider replayImagesProvider =
        context.watch<ReplayImagesProvider>();
    return Scaffold(
      appBar: AppBar(
        title: Text("Game Event Playback"),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Row(
              children: [
                if (widget.record.isCheatEnabled) ...[
                  ElevatedButton(
                    onPressed: null,
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
                  SizedBox(width: 50),
                SizedBox(
                  width: 200,
                  height: 200,
                  child: SizedBox(
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
                              '${AppLocalizations.of(context)!.gameInfos_timeTitle} : $formattedTime',
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
                          '${AppLocalizations.of(context)!.gameInfos_differencesPresentTitle} : ${widget.record.game.nDifferences}',
                          style: _textStyle(),
                          textAlign: TextAlign.center,
                        ),
                        Row(
                          children: [
                            if (widget.record.players.isNotEmpty) ...[
                              _playerInfo(replayPlayerProvider.getPlayer(0)),
                            ],
                            SizedBox(
                              width: 130,
                            ),
                            if (widget.record.players.length > 1) ...[
                              _playerInfo(replayPlayerProvider.getPlayer(1)),
                            ],
                          ],
                        ),
                        Row(
                          children: [
                            if (widget.record.players.length >= 3) ...[
                              _playerInfo(replayPlayerProvider.getPlayer(2)),
                            ],
                            if (widget.record.players.length >= 4) ...[
                              SizedBox(
                                width: 130,
                              ),
                              _playerInfo(replayPlayerProvider.getPlayer(3)),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(
              height: 20,
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
            Center(
              child: GameEventSlider(
                playbackService: playbackService,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    timer.cancel();
    playbackService.dispose();
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
}
