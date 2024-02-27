import 'package:flutter/material.dart';

import '../models/admin_games_model.dart';

class AdminPage extends StatefulWidget {
  @override
  State<AdminPage> createState() => _AdminPageState();
}

class _AdminPageState extends State<AdminPage> {
  List<AdminGame> games = [
    AdminGame('Angry Cat', 'assets/images/admin raccoon.jpeg'),
    AdminGame('Fat ratata', 'assets/images/admin raccoon.jpeg'),
    AdminGame('On se casse?', 'assets/images/admin raccoon.jpeg'),
    AdminGame('Krunker', 'assets/images/admin raccoon.jpeg'),
    AdminGame('Alien Swarm', 'assets/images/admin raccoon.jpeg'),
    AdminGame('Bubble bash', 'assets/images/admin raccoon.jpeg'),
    AdminGame('Cherche les diff', 'assets/images/admin raccoon.jpeg'),
    AdminGame('allo allo', 'assets/images/admin raccoon.jpeg'),
    AdminGame('a toute a lheure', 'assets/images/admin raccoon.jpeg'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Page d'administration"),
      ),
      body: Column(
        children: [
          Center(
            child: ElevatedButton(
              onPressed: () {
                setState(() {
                  games.clear();
                  //TODO: Implementer le vrai delete all
                });
              },
              child: Text('Supprimer tous les jeux'),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(5),
              child: GridView.builder(
                padding: EdgeInsets.all(8.0),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 8.0,
                  mainAxisSpacing: 8.0,
                ),
                itemCount: games.length,
                itemBuilder: (context, index) {
                  return GameCard(
                    game: games[index],
                    onDelete: () {
                      setState(() {
                        games.removeAt(index);
                        //TODO: Implementer le vrai delete
                      });
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class GameCard extends StatelessWidget {
  final AdminGame game;
  final VoidCallback onDelete;

  const GameCard({Key? key, required this.game, required this.onDelete})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          Text(
            game.gameName,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          Expanded(
            child: Image.asset(
              game.imagePath,
              fit: BoxFit.cover,
            ),
          ),
          IconButton(
            onPressed: onDelete,
            icon: Icon(Icons.delete),
          ),
        ],
      ),
    );
  }
}
