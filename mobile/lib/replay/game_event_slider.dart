import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/constants/app_constants.dart';
import 'package:mobile/models/game_record_model.dart';
import 'package:mobile/replay/game_event_playback_manager.dart';
import 'package:mobile/replay/game_events_services.dart';

class GameEventSlider extends StatefulWidget {
  final GameEventPlaybackService playbackService;
  final GameEventPlaybackManager playbackManager;

  GameEventSlider({
    super.key,
    required this.playbackService,
    required this.playbackManager,
  });

  @override
  State<GameEventSlider> createState() => _GameEventSliderState();
}

class _GameEventSliderState extends State<GameEventSlider> {
  Timer? _debounceTimer;

  double _sliderValue = 0;
  Duration _sliderTimer = Duration.zero;

  late StreamSubscription<GameEventData> _eventsSubscription;
  double _selectedSpeed = SPEED_X1;
  bool _isPlaying = true;
  bool isUserInteraction = false;

  @override
  void initState() {
    super.initState();

    _eventsSubscription =
        widget.playbackService.eventsStream.listen((GameEventData event) {
      if (!isUserInteraction) {
        _updateSliderValue(event);
      }
    }, onError: (error) {
      print("Error occurred in event subscription: $error");
    }, onDone: () {
      print("Event stream is closed");
    });
  }

  @override
  void dispose() {
    _eventsSubscription.cancel();
    _debounceTimer?.cancel();
    super.dispose();
  }

  void _onSliderChanged(double newValue) {
    isUserInteraction = true;
    setState(() {
      _isPlaying = false;
      _sliderValue = newValue;
    });
    int eventIndex =
        (newValue * (widget.playbackService.events.length - 1)).round();
    widget.playbackService.seekToEvent(eventIndex);
  }

  double calculateNormalizedSliderValue(int eventIndex) {
    return eventIndex / (widget.playbackService.events.length - 1).toDouble();
  }

  void _updateSliderValue(GameEventData event) {
    if (!isUserInteraction) {
      int eventIndex = widget.playbackService.events.indexOf(event);
      if (eventIndex != -1 && mounted) {
        setState(() {
          Future.delayed(Duration(milliseconds: 200), () {
            int sliderTime = widget.playbackManager.timeLimit - event.time!;

            if (mounted) {
              if (event.time == 0 || sliderTime < 0 || event.time == null) {
                return;
              }
              _sliderTimer = Duration(seconds: sliderTime);
              _sliderValue = calculateNormalizedSliderValue(eventIndex);
            }
          });
        });
      }
    }
  }

  void _triggerPlay() {
    setState(() {
      _isPlaying = !_isPlaying;
    });
    if (_isPlaying) {
      print("Resuming");
      widget.playbackService.resume();
    } else {
      print("Pausing");
      widget.playbackService.pause();
    }
  }

  void _goHome() {
    // TODO : Implement home functionality
    // Implement forward functionality
    // Navigator.pushNamed(context, DASHBOARD_ROUTE);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
        constraints: BoxConstraints(maxWidth: 1000, maxHeight: 130),
        child: Column(
          children: [
            Slider(
              min: 0,
              max: 1,
              value: _sliderValue,
              divisions: widget.playbackService.events.length - 1,
              onChanged: _onSliderChanged,
              onChangeEnd: (double value) {
                isUserInteraction = false;
              },
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // IconButton(
                //   icon: Icon(Icons.home),
                //   onPressed: _goHome,
                // ),
                IconButton(
                  icon: _isPlaying ? Icon(Icons.pause) : Icon(Icons.play_arrow),
                  onPressed: _triggerPlay,
                ),
                // Restart button
                IconButton(
                  icon: Icon(Icons.restart_alt),
                  onPressed: () {
                    widget.playbackService.restart();
                    setState(() {
                      _isPlaying = true;
                      _sliderValue = 0;
                    });
                  },
                ),
                // Speed buttons
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    for (double speed in [SPEED_X1, SPEED_X2, SPEED_X4])
                      _buildSpeedRadioButton(speed)
                  ],
                ),
              ],
            ),
            Text(_sliderTimer.toString().split('.').first),
          ],
        ));
  }

  Widget _buildSpeedRadioButton(double speed) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Radio<double>(
          value: speed,
          groupValue: _selectedSpeed,
          onChanged: (double? value) {
            if (value != null) {
              setState(() {
                _selectedSpeed = value;
                widget.playbackService.setSpeed(value);
              });
            }
          },
        ),
        Text('${speed}x'),
      ],
    );
  }
}