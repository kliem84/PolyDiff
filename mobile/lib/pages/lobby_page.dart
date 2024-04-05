import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:mobile/constants/app_constants.dart';
import 'package:mobile/constants/app_routes.dart';
import 'package:mobile/constants/enums.dart';
import 'package:mobile/services/chat_service.dart';
import 'package:mobile/services/game_manager_service.dart';
import 'package:mobile/services/info_service.dart';
import 'package:mobile/services/lobby_service.dart';
import 'package:mobile/services/socket_service.dart';
import 'package:mobile/widgets/chat_box.dart';
import 'package:mobile/widgets/customs/background_container.dart';
import 'package:mobile/widgets/customs/custom_btn.dart';
import 'package:provider/provider.dart';

class LobbyPage extends StatefulWidget {
  const LobbyPage({Key? key});

  static const routeName = LOBBY_ROUTE;

  static Route route() {
    return MaterialPageRoute(
      builder: (_) => const LobbyPage(),
      settings: const RouteSettings(name: routeName),
    );
  }

  @override
  State<LobbyPage> createState() => _LobbyPageState();
}

class _LobbyPageState extends State<LobbyPage> {
  @override
  Widget build(BuildContext context) {
    final lobbyService = context.watch<LobbyService>();
    final chatService = context.watch<ChatService>();
    final socketService = context.watch<SocketService>();
    final infoService = context.watch<InfoService>();
    final gameManagerService = context.watch<GameManagerService>();
    List<String> playerNames = lobbyService.lobby.players.map((e) {
      return e.name ?? '';
    }).toList();
    String gameModeName = lobbyService.gameModes.name;

    if (!lobbyService.isCurrentLobbyInLobbies()) {
      Future.delayed(Duration.zero, () {
        if (ModalRoute.of(context)?.isCurrent ?? false) {
          print('Current Lobby not in Lobbies navigating to DashBoardPage');
          Navigator.pushNamed(context, DASHBOARD_ROUTE);
        }
      });
    } else if (lobbyService.isCurrentLobbyStarted()) {
      Future.delayed(Duration.zero, () {
        if (ModalRoute.of(context)?.isCurrent ?? false) {
          print('Current Lobby is started navigating to GamePage');
          socketService.setup(SocketType.Game, infoService.id);
          chatService.setupGame();
          gameManagerService.setupGame();
          Navigator.pushNamed(context, GAME_ROUTE);
        }
      });
    }

    return BackgroundContainer(
      backgroundImagePath: infoService.isThemeLight
          ? SELECTION_BACKGROUND_PATH
          : SELECTION_BACKGROUND_PATH_DARK,
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SingleChildScrollView(
          child: Column(
            children: [
              Text(
                  '${AppLocalizations.of(context)!.lobby_title} $gameModeName'),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ChatBox(),
                  playersInfos(context, playerNames: playerNames),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  lobbyButton(context),
                  CustomButton(
                    text: AppLocalizations.of(context)!.lobby_quit,
                    press: () {
                      print('Quitting lobby');
                      lobbyService.leaveLobby();
                      Navigator.pushNamed(context, DASHBOARD_ROUTE);
                    },
                    widthFactor: 0.3,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget lobbyButton(BuildContext context) {
    final lobbyService = context.watch<LobbyService>();
    int nPlayers = lobbyService.lobby.players.length;
    if (!lobbyService.isCreator) {
      return Text(AppLocalizations.of(context)!.lobby_waiting);
    }
    if (nPlayers >= 2 && nPlayers <= 4) {
      return CustomButton(
        text: AppLocalizations.of(context)!.lobby_start,
        press: () {
          print('Starting the lobby');
          lobbyService.startLobby();
          // TODO: Add loading message for creator
          // Navigator.pushNamed(context, GAME_ROUTE);
        },
      );
    } else {
      return Text(AppLocalizations.of(context)!.lobby_startConditions);
    }
  }

  Widget playersInfos(BuildContext context,
      {List<String> playerNames = const []}) {
    return Container(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
              '${AppLocalizations.of(context)!.lobby_selection_nPlayers}: ${playerNames.length}/4'),
          Text(AppLocalizations.of(context)!.lobby_playersOnline,
              style: Theme.of(context).textTheme.titleLarge),
          ...playerNames.map((name) => Text(name)),
        ],
      ),
    );
  }
}
