import 'package:flutter/material.dart';

void main() {
  runApp(const AceCourtApp());
}

class AceCourtApp extends StatelessWidget {
  const AceCourtApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AceCourt',
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        appBar: AppBar(
          title: const Text('AceCourt — Catálogo de quadras'),
        ),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            Card(
              child: ListTile(
                leading: Icon(Icons.sports_tennis),
                title: Text('Quadra 1'),
                subtitle: Text(r'Saibro · Coberta · R$ 60 por hora'),
              ),
            ),
            Card(
              child: ListTile(
                leading: Icon(Icons.sports_tennis),
                title: Text('Quadra 2'),
                subtitle: Text(r'Piso rápido · Descoberta · R$ 80 por hora'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}