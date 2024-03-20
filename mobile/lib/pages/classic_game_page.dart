import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/constants/app_constants.dart';
import 'package:mobile/constants/app_routes.dart';
import 'package:mobile/constants/temp_images.dart'; // TODO : replace with specific image when http is setup
import 'package:mobile/models/canvas_model.dart';
import 'package:mobile/models/game.dart';
import 'package:mobile/services/coordinate_conversion_service.dart';
import 'package:mobile/services/game_area_service.dart';
import 'package:mobile/services/image_converter_service.dart';
import 'package:mobile/widgets/canvas.dart';
import 'package:mobile/widgets/chat_box.dart';
import 'package:provider/provider.dart';

class ClassicGamePage extends StatefulWidget {
  static const routeName = CLASSIC_ROUTE;

  ClassicGamePage();

  @override
  State<ClassicGamePage> createState() => _ClassicGamePageState();

  static Route<dynamic> route() {
    return MaterialPageRoute(
      builder: (_) => ClassicGamePage(),
      settings: RouteSettings(name: routeName),
    );
  }
}

class _ClassicGamePageState extends State<ClassicGamePage> {
  final ImageConverterService imageConverterService = ImageConverterService();
  final GameAreaService gameAreaService = Get.find();
  late Future<CanvasModel> imagesFuture;
  bool isChatBoxVisible = false;
  final tempGameManager = CoordinateConversionService();

  @override
  void initState() {
    super.initState();
    imagesFuture = loadImage();
  }

  Future<CanvasModel> loadImage() async {
    return imageConverterService.fromImagesBase64(originalImageTempBase64,
        modifiedImageTempBase64); // TODO : replace with specific image when http is setup
  }

  @override
  Widget build(BuildContext context) {
    final gameAreaService = Provider.of<GameAreaService>(context);
    //final lobbyService = context.watch<LobbyService>();
    return Scaffold(
      body: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              image: DecorationImage(
                image: AssetImage(GAME_BACKGROUND_PATH),
                fit: BoxFit.cover,
              ),
            ),
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.vpn_key_sharp),
                    iconSize: 70.0,
                    color: Colors.red,
                    onPressed: () {
                      List<List<Coordinate>> differences =
                          tempGameManager.testCheat();
                      List<Coordinate> mergedDifferences =
                          differences.expand((x) => x).toList();
                      gameAreaService.toggleCheatMode(mergedDifferences);
                    },
                  ),
                  SizedBox(
                    height: 200,
                    width: 1000,
                    //child:
                    // TODO: Place game info widget as a child here when ready
                  ),
                ],
              ),
              FutureBuilder<CanvasModel>(
                future: imagesFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.done) {
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        OriginalCanvas(snapshot.data, '123'),
                        SizedBox(width: 50),
                        ModifiedCanvas(snapshot.data, '123'),
                      ],
                    );
                  } else {
                    return CircularProgressIndicator();
                  }
                },
              ),
            ],
          ),
          if (isChatBoxVisible)
            Positioned(
              top: 50,
              left: 0,
              right: 0,
              height: 550,
              child: Align(
                alignment: Alignment.topCenter,
                child: AnimatedOpacity(
                  opacity: 1.0,
                  duration: Duration(milliseconds: 500),
                  child: Transform.scale(
                    scale: 1.0,
                    child: ChatBox(),
                  ),
                ),
              ),
            ),
          Positioned(
            left: 8.0,
            bottom: 8.0,
            child: ElevatedButton(
              onPressed: () {
                print('Abandon');
              },
              style: ElevatedButton.styleFrom(
                foregroundColor: Color(0xFFEF6151),
                backgroundColor: Color(0xFF2D1E16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18.0),
                ),
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              ),
              child: Text(
                'Abandonner',
                style: TextStyle(fontSize: 20),
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 20.0),
              child: IconButton(
                icon: Icon(Icons.chat),
                iconSize: 45.0,
                color: Colors.white,
                onPressed: () {
                  setState(() {
                    isChatBoxVisible = !isChatBoxVisible;
                  });
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}