import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/constants/app_text_constants.dart';
import 'package:mobile/services/form_service.dart';
import 'package:mobile/utils/credentials_validation.dart';
import 'package:mobile/widgets/customs/custom_text_input_field.dart';

class ChangePasswordPopup extends StatefulWidget {
  @override
  State<ChangePasswordPopup> createState() => _ChangePasswordPopupState();
}

class _ChangePasswordPopupState extends State<ChangePasswordPopup> {
  final FormService formService = Get.find();

  String errorMessage = "";

  bool isPasswordChanged = false;

  TextEditingController passwordController = TextEditingController();
  TextEditingController confirmationController = TextEditingController();
  String passwordStrength = '';
  String passwordConfirmation = '';

  late final CredentialsValidator _validator;

  @override
  void dispose() {
    passwordController.dispose();
    confirmationController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _validator = CredentialsValidator(
      onStateChanged: () {
        setState(() {
          // Force the widget to rebuild with updated validation status
        });
      },
    );
    passwordController.addListener(validatePassword);
    confirmationController.addListener(validatePasswordConfirmation);
  }

  void validatePassword() {
    _validator.updatePasswordStrength(passwordController.text);
    updateValidatorStates();
  }

  void validatePasswordConfirmation() {
    _validator.hasMatchingPasswords(
        passwordController.text, confirmationController.text);
    updateValidatorStates();
  }

  void updateValidatorStates() {
    setState(() {
      passwordStrength = _validator.passwordStrength;
      passwordConfirmation =
          _validator.states['passwordConfirmation'] == ValidatorState.isValid
              ? YES
              : NO;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Stack(
        children: [
          Container(
            width: 500,
            height: double.infinity,
            decoration: BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/password-raccoon.jpg'),
                fit: BoxFit.cover,
                colorFilter: ColorFilter.mode(
                  Colors.black.withOpacity(0.80),
                  BlendMode.dstATop,
                ),
              ),
              borderRadius: BorderRadius.circular(8.0),
            ),
          ),
          Container(
            width: 500,
            height: double.infinity,
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(8),
            ),
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "Changement de mot de passe",
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                  textAlign: TextAlign.center,
                ),
                Padding(
                  padding: EdgeInsets.only(top: 21),
                  child: SizedBox(
                    width: 500,
                    height: 400,
                    child: SingleChildScrollView(
                      child: isPasswordChanged
                          ? Column(children: [
                              Container(
                                padding: EdgeInsets.all(16.0),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(8.0),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.grey.withOpacity(0.5),
                                      spreadRadius: 2,
                                      blurRadius: 7,
                                      offset: Offset(0, 3),
                                    ),
                                  ],
                                ),
                                child: Text(
                                  "Mot de passe changé avec succès",
                                  style: TextStyle(
                                    color: Colors.black,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              SizedBox(height: 20),
                              ElevatedButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                style: ElevatedButton.styleFrom(
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(0),
                                  ),
                                  backgroundColor:
                                      Color.fromARGB(255, 31, 150, 104),
                                  foregroundColor: Colors.white,
                                ),
                                child: Text("Fermer"),
                              ),
                            ])
                          : Column(children: [
                              buildPasswordField(),
                              buildPasswordConfirmationField(),
                              (passwordConfirmation == YES
                                  ? changePasswordButton(context)
                                  : SizedBox()),
                            ]),
                    ),
                  ),
                ),
                Text(
                  errorMessage,
                  style: TextStyle(
                      color: const Color.fromARGB(255, 240, 16, 0),
                      fontSize: 15,
                      fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          Positioned(
            top: 0,
            right: 0,
            child: IconButton(
              icon: Icon(Icons.close),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget buildPasswordField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CustomTextInputField(
          label: "Mot de passe",
          controller: passwordController,
          hint: "Entrez votre mot de passe",
          helperText: 'Force du mot de passe: $passwordStrength',
          errorText: _validator.states['password'] == ValidatorState.isEmpty
              ? "Mot de passe requis"
              : null,
          maxLength: 20,
          isPassword: true,
        ),
        SizedBox(height: 10),
      ],
    );
  }

  Widget buildPasswordConfirmationField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CustomTextInputField(
          label: "Confirmation du mot de passe",
          controller: confirmationController,
          hint: "Confirmez votre mot de passe",
          helperText:
              'Doit correspondre au mot de passe: $passwordConfirmation',
          maxLength: 20,
          errorText: _validator.states['passwordConfirmation'] ==
                  ValidatorState.isEmpty
              ? "Veuillez confirmer votre mot de passe"
              : _validator.states['passwordConfirmation'] ==
                      ValidatorState.isInvalid
                  ? "Les mots de passes doivent être identiques"
                  : null,
          isPassword: true,
        ),
        SizedBox(height: 10),
      ],
    );
  }

  Widget changePasswordButton(BuildContext context) {
    return ElevatedButton(
      onPressed: () async {
        String? serverErrorMessage =
            await formService.changePassword(passwordController.text);
        if (serverErrorMessage == null) {
          setState(() {
            passwordController.text = "";
            confirmationController.text = "";
            isPasswordChanged = true;
          });
        } else {
          print('Erreur serveur');
          print(serverErrorMessage);
          setState(() {
            errorMessage = serverErrorMessage;
          });
        }
      },
      style: ElevatedButton.styleFrom(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(0),
        ),
        backgroundColor: Color.fromARGB(255, 31, 150, 104),
        foregroundColor: Colors.white,
      ),
      child: Text("Changer mon mot de passe"),
    );
  }
}