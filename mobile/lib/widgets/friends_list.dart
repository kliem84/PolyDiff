import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/constants/app_constants.dart';
import 'package:mobile/services/friend_service.dart';
import 'package:mobile/widgets/friends_popup.dart';
import 'package:provider/provider.dart';

class FriendsList extends StatefulWidget {
  @override
  State<FriendsList> createState() => _FriendsListState();
}

class _FriendsListState extends State<FriendsList> {
  @override
  void initState() {
    final FriendService friendService = Get.find();
    super.initState();
    friendService.fetchFriends();
  }

  @override
  Widget build(BuildContext context) {
    final friendService = context.watch<FriendService>();
    return ListView.builder(
      itemCount: friendService.friends.length,
      itemBuilder: (BuildContext context, int index) {
        final friend = friendService.friends[index];
        return Container(
          alignment: Alignment.center,
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: 750),
            child: Card(
              margin: EdgeInsets.all(8),
              child: ListTile(
                leading: Stack(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: Colors.grey[200],
                      backgroundImage:
                          AssetImage('assets/images/hallelujaRaccoon.jpeg'),
                    ),
                    // Positioned(
                    //   right: 0,
                    //   bottom: 0,
                    //   child: Container(
                    //     padding: EdgeInsets.all(1),
                    //     decoration: BoxDecoration(
                    //       color: Colors.white,
                    //       shape: BoxShape.circle,
                    //     ),
                    //     child: Icon(
                    //       Icons.circle,
                    //       color:
                    //           friend.isOnline ? Colors.green : Colors.red,
                    //       size: 20,
                    //     ),
                    //   ),
                    // ),
                  ],
                ),
                title: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(friend.name, style: TextStyle(fontSize: 25)),
                    SizedBox(width: 5),
                    // IconButton(
                    //   icon: Icon(
                    //     friend.isFavorite
                    //         ? Icons.favorite
                    //         : Icons.favorite_border,
                    //     //color: friend.isFavorite ? Colors.red : null,
                    //     size: 35,
                    //   ),
                    //   onPressed: () {
                    //     setState(() {
                    //       //friend.isFavorite = !friend.isFavorite;
                    //     });
                    //     // TODO: notify the server
                    //   },
                    // ),
                    SizedBox(width: 20),
                    TextButton(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (BuildContext context) {
                            return FriendsPopup(
                              username: friend.name,
                              allFriends: friend.friends,
                              commonFriends: friend.commonFriends,
                            );
                          },
                        );
                      },
                      style: TextButton.styleFrom(
                        foregroundColor: Colors.white,
                        backgroundColor: kLightGreen,
                        disabledForegroundColor: Colors.grey.withOpacity(0.38),
                      ),
                      child: Text('Amis', style: TextStyle(fontSize: 18)),
                    ),
                  ],
                ),
                //subtitle: Text(friend.isOnline ? 'Online' : 'Offline'),
                trailing: IconButton(
                  iconSize: 40,
                  icon: Icon(Icons.person_remove),
                  onPressed: () {
                    print("delete ${friend.name}");
                  },
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
