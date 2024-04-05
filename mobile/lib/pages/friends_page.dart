import 'package:flutter/material.dart';
import 'package:mobile/constants/app_constants.dart';
import 'package:mobile/constants/app_routes.dart';
import 'package:mobile/widgets/customs/custom_app_bar.dart';
import 'package:mobile/widgets/customs/custom_menu_drawer.dart';
import 'package:mobile/widgets/friends_list.dart';
import 'package:mobile/widgets/friends_pending.dart';
import 'package:mobile/widgets/friends_search.dart';

class FriendsPage extends StatefulWidget {
  static const routeName = FRIENDS_ROUTE;

  static Route<dynamic> route() {
    return MaterialPageRoute(
      builder: (_) => FriendsPage(),
      settings: RouteSettings(name: routeName),
    );
  }

  @override
  State<FriendsPage> createState() => _FriendsPageState();
}

class _FriendsPageState extends State<FriendsPage> {
  int _selectedViewIndex = 0;

  void _selectView(int index) {
    setState(() {
      _selectedViewIndex = index;
    });
  }

// TODO: When the real connection is done, move each returned widget into separate files
  Widget _buildContent() {
    switch (_selectedViewIndex) {
      case 0:
        return FriendsList();
      case 1:
        return FriendsPending();
      case 2:
        return FriendsSearch();

      default:
        return Text("Contenu non disponible");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: CustomMenuDrawer(),
      appBar: CustomAppBar(title: "Page d'amis"),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/images/LimitedTimeBackground.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                for (int i = 0; i < 3; i++) ...[
                  ElevatedButton(
                    onPressed: () => _selectView(i),
                    style: ButtonStyle(
                      backgroundColor: MaterialStateProperty.resolveWith<Color>(
                        (Set<MaterialState> states) {
                          if (_selectedViewIndex == i) {
                            return Color.fromARGB(255, 2, 70, 22);
                          } else {
                            return kLightGreen;
                          }
                        },
                      ),
                    ),
                    child: Text(
                        i == 0
                            ? "Tous les amis"
                            : (i == 1 ? "En attente" : "Ajouter un ami"),
                        style: TextStyle(fontSize: 25, color: Colors.white)),
                  ),
                ]
              ],
            ),
            Expanded(
              child: _buildContent(),
            ),
          ],
        ),
      ),
    );
  }
}
