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
            style: ElevatedButton.styleFrom(
              side: BorderSide(
                  color: Colors.black, width: 2.0),
              shape: RoundedRectangleBorder(
                borderRadius:
                    BorderRadius.circular(30.0),
              ),
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            ),
            onPressed: press,
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
