import 'package:flutter/material.dart';

class BackgroundImage extends StatelessWidget {
  const BackgroundImage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context)
          .size
          .height, // Ensure the image covers the full screen height
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage('assets/images/MenuBackground.jpg'),
          fit: BoxFit.cover,
        ),
      ),
    );
  }
}
