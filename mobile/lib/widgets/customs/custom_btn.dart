import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback press;
  final IconData? icon;
  final double widthFactor;
  final double height;

  const CustomButton({
    required this.text,
    required this.press,
    this.icon,
    this.widthFactor = 0.20,
    this.height = 50.0,
  });

  @override
  Widget build(BuildContext context) {
    Size size = MediaQuery.of(context).size;
    return Center(
      child: Container(
        margin: EdgeInsets.symmetric(vertical: 10),
        width: size.width * widthFactor,
        height: height,
        child: ClipRRect(
          child: ElevatedButton(
            onPressed: press,
            style: ElevatedButton.styleFrom(
              shape: StadiumBorder(),
              side: BorderSide.none,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              textStyle: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                letterSpacing: 5,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null)
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Icon(icon),
                  ),
                Text(text),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
