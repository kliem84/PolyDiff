import 'dart:async';

import 'package:mobile/constants/enums.dart';
import 'package:mobile/replay/replay_model.dart';

class CaptureGameEventsService {
  final _replayEventsController = StreamController<ReplayGameEvent>.broadcast();

  Stream<ReplayGameEvent> get replayEventsStream =>
      _replayEventsController.stream;

  void saveReplayEvent(GameEvents action, Map<String, dynamic> data) {
    final replayEvent = ReplayGameEvent(
      action: action,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      data: data,
    );
    print('about to add replay event: $data');
    _replayEventsController.add(replayEvent);
  }

  void dispose() {
    _replayEventsController.close();
  }
}
