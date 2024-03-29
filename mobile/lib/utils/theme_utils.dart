import 'package:flutter/material.dart';

class ThemeClass {
  // Colors
  Color kDark = Colors.black;
  Color kLight = Color(0xFFFFFFFF);

  Color kLime = Color.fromRGBO(158, 157, 36, 1);

  Color kGreen = Color(0xFF43A047);
  Color kLightGreen = Color.fromRGBO(85, 139, 47, 1);
  Color kMidGreen = Color.fromRGBO(123, 142, 5, 1);
  Color kDarkGreen = Color.fromARGB(255, 7, 93, 15);

  Color kLightOrange = Color.fromRGBO(245, 124, 0, 1);
  Color kMidOrange = Color.fromRGBO(239, 108, 0, 1);
  Color kDarkOrange = Color.fromRGBO(230, 81, 0, 1);

  Color kMidPink = Color.fromRGBO(255, 105, 180, 1);

  static ThemeData lightTheme = ThemeData(
    primaryColor: ThemeData.light().scaffoldBackgroundColor,
    fontFamily: 'troika',
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ButtonStyle(
        backgroundColor:
            MaterialStateProperty.all<Color>(_themeClass.kMidOrange),
        foregroundColor: MaterialStateProperty.all<Color>(_themeClass.kLight),
        shape: MaterialStateProperty.all<StadiumBorder>(StadiumBorder()),
        side: MaterialStateProperty.all<BorderSide>(
          BorderSide(
            color: _themeClass.kLightOrange,
            width: 2,
          ),
        ),
      ),
    ),
    colorScheme: const ColorScheme.light().copyWith(
      primary: _themeClass.kLightOrange,
      secondary: _themeClass.kMidOrange,
      onSecondary: _themeClass.kLight,
    ),
  );

  static ThemeData darkTheme = ThemeData(
    primaryColor: _themeClass.kDarkGreen,
    fontFamily: 'troika',
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ButtonStyle(
        backgroundColor:
            MaterialStateProperty.all<Color>(_themeClass.kDarkGreen),
        foregroundColor: MaterialStateProperty.all<Color>(_themeClass.kLight),
        shape: MaterialStateProperty.all<StadiumBorder>(StadiumBorder()),
        side: MaterialStateProperty.all<BorderSide>(
          BorderSide(
            color: _themeClass.kLightGreen,
            width: 2,
          ),
        ),
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: _themeClass.kDarkGreen,
    ),
    textButtonTheme: TextButtonThemeData(
      style: ButtonStyle(
        foregroundColor: MaterialStateProperty.all<Color>(_themeClass.kLight),
      ),
    ),
    listTileTheme: ListTileThemeData(
      tileColor: _themeClass.kDarkGreen,
      selectedTileColor: _themeClass.kMidGreen,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    cardTheme: CardTheme(
      color: _themeClass.kDarkGreen,
      margin: EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      elevation: 3,
    ),
    iconTheme: IconThemeData(color: _themeClass.kLight),
    iconButtonTheme: IconButtonThemeData(
      style: ButtonStyle(
        backgroundColor: MaterialStateProperty.all<Color>(_themeClass.kDark),
        foregroundColor: MaterialStateProperty.all<Color>(_themeClass.kLight),
      ),
    ),
    colorScheme: const ColorScheme.dark().copyWith(
      primary: _themeClass.kDarkGreen,
      onPrimary: _themeClass.kLight,
      secondary: _themeClass.kDark,
      onSecondary: _themeClass.kLight,
    ),
  );
}

ThemeClass _themeClass = ThemeClass();
