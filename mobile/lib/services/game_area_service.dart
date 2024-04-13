import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/constants/app_constants.dart';
import 'package:mobile/models/game.dart';
import 'package:mobile/models/models.dart';
import 'package:mobile/services/sound_service.dart';

class GameAreaService extends ChangeNotifier {
  final SoundService soundService = Get.find();
  GameAreaService();
  List<Coordinate> coordinates = [];
  List<Coordinate> leftErrorCoord = [];
  List<Coordinate> rightErrorCoord = [];
  Path? blinkingDifference;
  Path? cheatBlinkingDifference;
  Paint blinkingColor = Paint()
    ..color = Colors.green
    ..style = PaintingStyle.fill;
  bool isCheatMode = false;
  bool isClickDisabled = false;
  bool _isAnimationPaused = false;
  Function? onCheatModeDeactivated;

  // Pour animer, il y a trois options SPEED_X1, SPEED_X2 ET SPEED_X3
  // Par défaut la vitesse c'est SPEED_X1 si tu call showDifferenceFound
  // avec seulement des coordonnées, même logique pour toggleCheatMode et showDifferenceNotFound
  void showDifferenceFound(List<Coordinate> newCoordinates,
      [double flashingSpeed = SPEED_X1]) {
    if (newCoordinates.isNotEmpty) {
      soundService.playCorrectSound();
      coordinates.addAll(newCoordinates);
    }
    if (isCheatMode) {
      onCheatModeDeactivated?.call();
    }
    isCheatMode = false;
    resetCheatBlinkingDifference();
    notifyListeners();
    startBlinking(newCoordinates, flashingSpeed);
  }

  void showDifferenceNotFound(Coordinate currentCoord, bool isLeft,
      [double flashingSpeed = SPEED_X1]) {
    if (isLeft) {
      isClickDisabled = true;
      soundService.playErrorSound();
      leftErrorCoord.add(currentCoord);
      notifyListeners();
      Future.delayed(Duration(seconds: (1 / flashingSpeed).floor()), () {
        leftErrorCoord = [];
        notifyListeners();
        isClickDisabled = false;
      });
    } else {
      isClickDisabled = true;
      soundService.playErrorSound();
      rightErrorCoord.add(currentCoord);
      notifyListeners();
      Future.delayed(Duration(seconds: (1 / flashingSpeed).floor()), () {
        rightErrorCoord = [];
        notifyListeners();
        isClickDisabled = false;
      });
    }
  }

  void initPath(List<Coordinate> coords) {
    final path = Path();
    for (var coord in coords) {
      path.addRect(Rect.fromLTWH(
        coord.x.toDouble(),
        coord.y.toDouble(),
        1,
        1,
      ));
    }
    blinkingDifference = path;
  }

  Future<void> startBlinking(List<Coordinate> coords,
      [double flashingSpeed = SPEED_X1]) async {
    initPath(coords);
    if (blinkingDifference == null) return;

    final Path blinkingPath = blinkingDifference!;
    const int timeToBlinkMs = 100;

    for (int i = 0; i < 3; i++) {
      while (_isAnimationPaused) {
        await Future.delayed(Duration(milliseconds: 100));
      }
      await showDifferenceColor(
          blinkingPath, (timeToBlinkMs / flashingSpeed).floor(), Colors.green);
      while (_isAnimationPaused) {
        await Future.delayed(Duration(milliseconds: 100));
      }
      await showDifferenceColor(
          blinkingPath, (timeToBlinkMs / flashingSpeed).floor(), Colors.yellow);
    }

    resetBlinkingDifference();
  }

  Future<void> showDifferenceColor(
      Path difference, int waitingTimeMs, Color color) async {
    blinkingColor.color = color;
    blinkingDifference = difference;
    notifyListeners();
    await Future.delayed(Duration(milliseconds: waitingTimeMs));
  }

  void resetBlinkingDifference() {
    blinkingDifference = null;
    notifyListeners();
  }

  void initCheatPath(List<Coordinate> coords) {
    final cheatPath = Path();
    for (var coord in coords) {
      cheatPath.addRect(Rect.fromLTWH(
        coord.x.toDouble(),
        coord.y.toDouble(),
        1,
        1,
      ));
    }
    cheatBlinkingDifference = cheatPath;
  }

  Future<void> toggleCheatMode(List<Coordinate> coords,
      [double flashingSpeed = SPEED_X1]) async {
    isCheatMode = !isCheatMode;
    if (isCheatMode) {
      initCheatPath(coords);
      if (cheatBlinkingDifference == null) return;

      final Path blinkingCheatPath = cheatBlinkingDifference!;
      const int timeToBlinkMs = 150;
      const int cheatModeWaitMs = 250;
      while (isCheatMode) {
        while (_isAnimationPaused) {
          await Future.delayed(Duration(milliseconds: 100));
        }

        await blinkCheatDifference(
            blinkingCheatPath, (timeToBlinkMs / flashingSpeed).floor());

        while (_isAnimationPaused) {
          await Future.delayed(Duration(milliseconds: 100));
        }

        await blinkCheatDifference(
            null, (cheatModeWaitMs / flashingSpeed).floor());

        if (!isCheatMode) {
          break;
        }
      }
    } else {
      resetCheatBlinkingDifference();
      return;
    }
    resetCheatBlinkingDifference();
  }

  Future<void> blinkCheatDifference(Path? difference, int waitingTimeMs) async {
    blinkingColor.color = Colors.red;
    cheatBlinkingDifference = difference;
    notifyListeners();
    await Future.delayed(Duration(milliseconds: waitingTimeMs));
  }

  void resetCheatBlinkingDifference() {
    cheatBlinkingDifference = null;
    notifyListeners();
  }

  void pauseAnimation() {
    _isAnimationPaused = true;
  }

  void resumeAnimation() {
    _isAnimationPaused = false;
    notifyListeners();
  }
}
