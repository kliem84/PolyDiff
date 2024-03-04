import 'package:flutter/material.dart';

class CustomTextInputField extends StatefulWidget {
  final Function(String)? onInputTextChanged;
  final String label;
  final TextEditingController controller;
  final String hint;
  final String? helperText;
  final int maxLength;
  final double width;
  final bool isPassword;

  CustomTextInputField({
    super.key,
    this.onInputTextChanged,
    required this.label,
    required this.controller,
    required this.hint,
    this.maxLength = 20,
    this.width = 400,
    this.isPassword = false,
    this.helperText,
  });

  @override
  State<CustomTextInputField> createState() => _CustomTextInputFieldState();
}

class _CustomTextInputFieldState extends State<CustomTextInputField> {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Container(
        constraints: BoxConstraints(maxWidth: widget.width),
        child: TextField(
          controller: widget.controller,
          obscureText: widget.isPassword,
          maxLength: widget.maxLength,
          onChanged: (value) {
            widget.onInputTextChanged!(value);
          },
          decoration: InputDecoration(
            labelText: widget.label,
            hintText: widget.hint,
            helperText: widget.helperText,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(30.0),
              borderSide: BorderSide.none,
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(30.0),
              borderSide: BorderSide(color: Colors.orange, width: 2.0),
            ),
            filled: true,
            fillColor: Colors.grey[200],
          ),
        ),
      ),
    );
  }
}