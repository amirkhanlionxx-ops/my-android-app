import { PracticeChallenge } from '../types';

export interface PracticeCategoryItem {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  platform: 'android' | 'flutter';
}

// 5 Dedicated Categories for Android
export const androidPracticeCategories: PracticeCategoryItem[] = [
  {
    id: 'an_cat_1',
    name: 'Android Kotlin & Compose',
    subtitle: 'State, Recomposition & UI',
    icon: 'fa-android',
    color: '#3DDC84',
    platform: 'android',
  },
  {
    id: 'an_cat_2',
    name: 'Android Room DB & SQLite',
    subtitle: 'Entities, DAO Queries & Cache',
    icon: 'fa-database',
    color: '#0A84FF',
    platform: 'android',
  },
  {
    id: 'an_cat_3',
    name: 'Android Coroutines & Flow',
    subtitle: 'Background Dispatchers & Streams',
    icon: 'fa-bolt',
    color: '#FF9500',
    platform: 'android',
  },
  {
    id: 'an_cat_4',
    name: 'Android Retrofit & REST APIs',
    subtitle: 'JSON Parsing & Network Endpoints',
    icon: 'fa-network-wired',
    color: '#AF52DE',
    platform: 'android',
  },
  {
    id: 'an_cat_5',
    name: 'Android Clean Architecture & MVVM',
    subtitle: 'Repository, ViewModel & StateFlow',
    icon: 'fa-layer-group',
    color: '#FF2D55',
    platform: 'android',
  },
];

// 5 Dedicated Categories for Flutter
export const flutterPracticeCategories: PracticeCategoryItem[] = [
  {
    id: 'fl_cat_1',
    name: 'Flutter Widgets & Layout UI',
    subtitle: 'Stateless, Stateful & Custom Layouts',
    icon: 'fa-cube',
    color: '#0175C2',
    platform: 'flutter',
  },
  {
    id: 'fl_cat_2',
    name: 'Flutter State (Riverpod & Bloc)',
    subtitle: 'Notifiers, Events & State Emit',
    icon: 'fa-sliders-h',
    color: '#13B9FD',
    platform: 'flutter',
  },
  {
    id: 'fl_cat_3',
    name: 'Flutter Async Dart & Streams',
    subtitle: 'Futures, StreamControllers & Rx',
    icon: 'fa-wind',
    color: '#54C5F8',
    platform: 'flutter',
  },
  {
    id: 'fl_cat_4',
    name: 'Flutter Dio & REST Integration',
    subtitle: 'HTTP Clients, Interceptors & Models',
    icon: 'fa-cloud-arrow-down',
    color: '#00B4D8',
    platform: 'flutter',
  },
  {
    id: 'fl_cat_5',
    name: 'Flutter Clean Architecture',
    subtitle: 'Domain UseCases & Data Sources',
    icon: 'fa-cubes',
    color: '#0077B6',
    platform: 'flutter',
  },
];

export const practiceChallenges: PracticeChallenge[] = [
  // =================== ANDROID 5 CATEGORIES ===================
  // 1. Android Kotlin & Compose
  {
    id: 'an_01',
    title: 'Jetpack Compose Counter State',
    category: 'Android Kotlin & Compose',
    difficulty: 'Easy',
    language: 'Kotlin',
    description: 'Implement a Jetpack Compose counter function that simulates state recompositions upon user clicks.',
    starterCode: `fun simulateCounter(clicks: Int): Int {
    var count = 0
    println("Initial Compose State: count = $count")
    for (i in 1..clicks) {
        count += 1
        println("Recomposing: count = $count")
    }
    return count
}

fun main() {
    val finalCount = simulateCounter(3)
    println("Final Composed UI Value: $finalCount")
}`,
    expectedOutput: `Initial Compose State: count = 0\nRecomposing: count = 1\nRecomposing: count = 2\nRecomposing: count = 3\nFinal Composed UI Value: 3`,
    hint: 'Compose recomposes when mutableStateOf or StateFlow changes.'
  },
  // 2. Android Room DB & SQLite
  {
    id: 'an_02',
    title: 'Room Entity & DAO In-Memory Simulation',
    category: 'Android Room DB & SQLite',
    difficulty: 'Medium',
    language: 'Kotlin',
    description: 'Simulate an Android Room DAO entity with insert and query operations.',
    starterCode: `data class UserEntity(val id: Int, val username: String, val role: String)

class MockUserDao {
    private val db = mutableListOf<UserEntity>()

    fun insertUser(user: UserEntity) {
        db.add(user)
        println("Room Inserted: \${user.username} (ID: \${user.id})")
    }

    fun getAllUsers(): List<UserEntity> = db.toList()
}

fun main() {
    val dao = MockUserDao()
    dao.insertUser(UserEntity(1, "john_dev", "Android Engineer"))
    dao.insertUser(UserEntity(2, "sarah_ui", "Compose Designer"))
    println("Total DB records: \${dao.getAllUsers().size}")
}`,
    expectedOutput: `Room Inserted: john_dev (ID: 1)\nRoom Inserted: sarah_ui (ID: 2)\nTotal DB records: 2`,
    hint: 'Room entities map directly to SQLite tables using @Entity annotations.'
  },
  // 3. Android Coroutines & Flow
  {
    id: 'an_03',
    title: 'Coroutines Flow Stream Collector',
    category: 'Android Coroutines & Flow',
    difficulty: 'Easy',
    language: 'Kotlin',
    description: 'Create a cold Flow that emits consecutive status events to demonstrate coroutine streaming.',
    starterCode: `fun simulateFlow(): List<String> {
    val events = listOf("INITIALIZING", "LOADING_DATA", "SYNCED_OK")
    val logs = mutableListOf<String>()
    for (e in events) {
        logs.add("Flow Emitted: $e")
    }
    return logs
}

fun main() {
    println("Starting Android Coroutine Flow:")
    val collected = simulateFlow()
    collected.forEach { println(it) }
    println("Flow Stream Collection Completed.")
}`,
    expectedOutput: `Starting Android Coroutine Flow:\nFlow Emitted: INITIALIZING\nFlow Emitted: LOADING_DATA\nFlow Emitted: SYNCED_OK\nFlow Stream Collection Completed.`,
    hint: 'Kotlin Flow emits items sequentially across Dispatchers.IO and Dispatchers.Main.'
  },
  // 4. Android Retrofit & REST APIs
  {
    id: 'an_04',
    title: 'Retrofit HTTP API Response Parser',
    category: 'Android Retrofit & REST APIs',
    difficulty: 'Medium',
    language: 'Kotlin',
    description: 'Simulate a Retrofit service deserializing a JSON HTTP response into a Kotlin data class.',
    starterCode: `data class ApiResponse(val status: Int, val message: String, val dataCount: Int)

fun parseRetrofitResponse(statusCode: Int, body: String): ApiResponse {
    println("--> HTTP GET /api/v1/projects Response Code: $statusCode")
    return ApiResponse(status = statusCode, message = "OK", dataCount = 12)
}

fun main() {
    val response = parseRetrofitResponse(200, "{\"success\":true}")
    println("Parsed ApiResponse: status=\${response.status}, message=\${response.message}, count=\${response.dataCount}")
}`,
    expectedOutput: `--> HTTP GET /api/v1/projects Response Code: 200\nParsed ApiResponse: status=200, message=OK, count=12`,
    hint: 'Use Moshi or Kotlinx Serialization converters with Retrofit.'
  },
  // 5. Android Clean Architecture & MVVM
  {
    id: 'an_05',
    title: 'MVVM ViewModel StateFlow Reducer',
    category: 'Android Clean Architecture & MVVM',
    difficulty: 'Hard',
    language: 'Kotlin',
    description: 'Build an MVVM ViewModel pattern holding UI State and processing intent actions.',
    starterCode: `sealed class UiState {
    object Loading : UiState()
    data class Success(val items: List<String>) : UiState()
}

class MainViewModel {
    var state: UiState = UiState.Loading

    fun loadData() {
        println("State: Loading")
        state = UiState.Success(listOf("Compose", "Coroutines", "Room"))
        println("State: Success with 3 items")
    }
}

fun main() {
    val vm = MainViewModel()
    vm.loadData()
    if (vm.state is UiState.Success) {
        val s = vm.state as UiState.Success
        println("ViewModel Rendered Items: \${s.items.joinToString(", ")}")
    }
}`,
    expectedOutput: `State: Loading\nState: Success with 3 items\nViewModel Rendered Items: Compose, Coroutines, Room`,
    hint: 'In clean architecture, ViewModels expose immutable StateFlow to Composable views.'
  },

  // =================== FLUTTER 5 CATEGORIES ===================
  // 1. Flutter Widgets & Layout UI
  {
    id: 'fl_01',
    title: 'Flutter Custom Widget Tree Builder',
    category: 'Flutter Widgets & Layout UI',
    difficulty: 'Easy',
    language: 'Dart',
    description: 'Construct a structured widget tree hierarchy using Container, Column, and Text.',
    starterCode: `class MockWidget {
  final String name;
  final List<MockWidget> children;
  MockWidget(this.name, [this.children = const []]);

  void printTree(int depth) {
    print('\${"  " * depth}* <$name>');
    for (var child in children) {
      child.printTree(depth + 1);
    }
  }
}

void main() {
  print('Building Flutter UI Widget Tree:');
  final tree = MockWidget('Scaffold', [
    MockWidget('AppBar', [MockWidget('Text("Dashboard")')]),
    MockWidget('Body', [
      MockWidget('Column', [
        MockWidget('ElevatedButton'),
        MockWidget('ListView')
      ])
    ])
  ]);
  tree.printTree(0);
  print('Widget Tree Rendered Successfully!');
}`,
    expectedOutput: `Building Flutter UI Widget Tree:\n* <Scaffold>\n  * <AppBar>\n    * <Text("Dashboard")>\n  * <Body>\n    * <Column>\n      * <ElevatedButton>\n      * <ListView>\nWidget Tree Rendered Successfully!`,
    hint: 'Everything in Flutter is a Widget—from layout to visual elements.'
  },
  // 2. Flutter State (Riverpod & Bloc)
  {
    id: 'fl_02',
    title: 'Flutter Riverpod StateNotifier Pattern',
    category: 'Flutter State (Riverpod & Bloc)',
    difficulty: 'Medium',
    language: 'Dart',
    description: 'Simulate a Flutter StateNotifier that updates immutable state upon events.',
    starterCode: `class CounterState {
  final int count;
  final String status;
  const CounterState(this.count, this.status);
}

class CounterNotifier {
  CounterState state = const CounterState(0, "IDLE");

  void increment() {
    state = CounterState(state.count + 1, "INCREMENTED");
    print('StateNotifier Emitted: count = \${state.count}, status = \${state.status}');
  }
}

void main() {
  final notifier = CounterNotifier();
  print('Initial State: count = \${notifier.state.count}');
  notifier.increment();
  notifier.increment();
  print('Final Notifier Value: \${notifier.state.count}');
}`,
    expectedOutput: `Initial State: count = 0\nStateNotifier Emitted: count = 1, status = INCREMENTED\nStateNotifier Emitted: count = 2, status = INCREMENTED\nFinal Notifier Value: 2`,
    hint: 'StateNotifier promotes single-source-of-truth and testability in Flutter.'
  },
  // 3. Flutter Async Dart & Streams
  {
    id: 'fl_03',
    title: 'Dart Async/Await Futures & Stream Broadcast',
    category: 'Flutter Async Dart & Streams',
    difficulty: 'Easy',
    language: 'Dart',
    description: 'Demonstrate asynchronous Future resolution and stream processing in Dart.',
    starterCode: `Future<String> fetchUserToken() async {
  return 'FLUTTER_JWT_987654';
}

void main() async {
  print('Requesting Flutter Auth Token...');
  final token = await fetchUserToken();
  print('Token Received: $token');
  print('Stream Broadcast: Session Connected');
}`,
    expectedOutput: `Requesting Flutter Auth Token...\nToken Received: FLUTTER_JWT_987654\nStream Broadcast: Session Connected`,
    hint: 'Dart runs on an event loop; await suspends until the Future completes.'
  },
  // 4. Flutter Dio & REST Integration
  {
    id: 'fl_04',
    title: 'Dio HTTP Interceptor & Data Serialization',
    category: 'Flutter Dio & REST Integration',
    difficulty: 'Medium',
    language: 'Dart',
    description: 'Simulate a Dio HTTP request with an authorization header and JSON response.',
    starterCode: `class DioClient {
  Map<String, String> headers = {'Content-Type': 'application/json'};

  void addAuthToken(String token) {
    headers['Authorization'] = 'Bearer $token';
    print('Dio Interceptor: Injected Bearer Token');
  }

  Map<String, dynamic> get(String url) {
    print('Dio GET $url with headers: $headers');
    return {'status': 200, 'data': ['flutter_project_1', 'flutter_project_2']};
  }
}

void main() {
  final dio = DioClient();
  dio.addAuthToken('SECURE_KEY_123');
  final res = dio.get('https://api.flutter.dev/projects');
  print('Response Status: \${res['status']}, Items: \${(res['data'] as List).length}');
}`,
    expectedOutput: `Dio Interceptor: Injected Bearer Token\nDio GET https://api.flutter.dev/projects with headers: {Content-Type: application/json, Authorization: Bearer SECURE_KEY_123}\nResponse Status: 200, Items: 2`,
    hint: 'Dio interceptors let you centrally inject auth tokens and log requests.'
  },
  // 5. Flutter Clean Architecture
  {
    id: 'fl_05',
    title: 'Clean Architecture Repository & UseCase',
    category: 'Flutter Clean Architecture',
    difficulty: 'Hard',
    language: 'Dart',
    description: 'Implement a Clean Architecture Domain UseCase decoupling UI from DataSource.',
    starterCode: `abstract class ProjectRepository {
  List<String> getProjects();
}

class ProjectRepositoryImpl implements ProjectRepository {
  @override
  List<String> getProjects() => ['ShopApp', 'ChatFlutter', 'CryptoTracker'];
}

class GetProjectsUseCase {
  final ProjectRepository repository;
  GetProjectsUseCase(this.repository);

  List<String> execute() {
    print('Executing Domain UseCase: GetProjectsUseCase');
    return repository.getProjects();
  }
}

void main() {
  final repo = ProjectRepositoryImpl();
  final useCase = GetProjectsUseCase(repo);
  final projects = useCase.execute();
  print('Projects Retrieved: \${projects.join(", ")}');
}`,
    expectedOutput: `Executing Domain UseCase: GetProjectsUseCase\nProjects Retrieved: ShopApp, ChatFlutter, CryptoTracker`,
    hint: 'UseCases encapsulate single business operations independent of any UI framework.'
  }
];
