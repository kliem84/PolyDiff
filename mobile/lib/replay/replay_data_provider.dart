import 'package:flutter/material.dart';
import 'package:mobile/replay/replay_game_model.dart';
import 'package:mobile/replay/replay_player_model.dart';

class ReplayDataProvider extends ChangeNotifier {
  Map<String, dynamic> _recordData = {};
  List<Difference> _displayDifferences = [];
  int _removedDifferences = 0;

  ReplayPlayer _player1 = ReplayPlayer(
    accountId: '',
    username: '',
    foundDifference: List<Difference>.empty(),
    count: 0,
  );

  ReplayPlayer _player2 = ReplayPlayer(
    accountId: '',
    username: '',
    foundDifference: List<Difference>.empty(),
    count: 0,
  );

  ReplayPlayer _player3 = ReplayPlayer(
    accountId: '',
    username: '',
    foundDifference: List<Difference>.empty(),
    count: 0,
  );

  ReplayPlayer _player4 = ReplayPlayer(
    accountId: '',
    username: '',
    foundDifference: List<Difference>.empty(),
    count: 0,
  );

  Map<String, dynamic> get recordData => _recordData;
  List<Difference> get displayDifferences => _displayDifferences;
  int get removedDifferences => _removedDifferences;

  // Players
  ReplayPlayer get player1 => _player1;
  ReplayPlayer get player2 => _player2;
  ReplayPlayer get player3 => _player3;
  ReplayPlayer get player4 => _player4;

  void loadRecordData(Map<String, dynamic> data) {
    _recordData = data;
    notifyListeners();
  }

  void updatePlayer1(ReplayPlayer player1Data) {
    _player1 = _player1.copyWith(
      accountId: player1Data.accountId,
      username: player1Data.username,
      foundDifference: player1Data.foundDifference,
      count: player1Data.count,
    );
    notifyListeners();
  }

  void updatePlayer2(ReplayPlayer player2Data) {
    _player2 = _player2.copyWith(
        accountId: player2Data.accountId,
        username: player2Data.username,
        foundDifference: player2Data.foundDifference,
        count: player2Data.count);
    notifyListeners();
  }

  void updatePlayer3(ReplayPlayer player3Data) {
    _player3 = _player3.copyWith(
        accountId: player3Data.accountId,
        username: player3Data.username,
        foundDifference: player3Data.foundDifference,
        count: player3Data.count);
    notifyListeners();
  }

  void updatePlayer4(ReplayPlayer player4Data) {
    _player4 = _player4.copyWith(
        accountId: player4Data.accountId,
        username: player4Data.username,
        foundDifference: player4Data.foundDifference,
        count: player4Data.count);
    notifyListeners();
  }

  void updateDisplayDifferences(int index, Difference foundDifference) {
    _displayDifferences[index] = foundDifference;
    _removedDifferences += 1;
    notifyListeners();
  }

  void resetDifference() {
    _removedDifferences = 0;
  }
}
