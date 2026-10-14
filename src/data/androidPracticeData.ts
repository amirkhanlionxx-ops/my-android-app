import { ProjectItem, TutorialItem, DEFAULT_TUTORIALS } from './practiceProjectsData';
import { BlockItem, DEFAULT_BLOCKS } from './practiceBlocksData';

export const DEFAULT_ANDROID_PRACTICE_PROJECTS: ProjectItem[] = [
  {
    id: 'an_proj_1',
    name: '1_Compose_Counter.kt',
    lang: 'Kotlin',
    isOriginal: true,
    code: `package com.myapp.android

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.unit.dp

@Composable
fun ComposeCounterScreen() {
    var count by remember { mutableStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Compose State Counter",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "$count",
            style = MaterialTheme.typography.displayLarge
        )
        Spacer(modifier = Modifier.height(24.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Button(onClick = { count++ }) {
                Text("Increment (+)")
            }
            OutlinedButton(onClick = { count = 0 }) {
                Text("Reset")
            }
        }
    }
}`,
    html: `<div class="an-compose-scaffold">
  <div class="an-topbar">
    <span class="an-badge">JETPACK COMPOSE</span>
    <span>Compose Counter</span>
  </div>
  <div class="an-body">
    <p class="an-sub">STATE FLOW COUNTER</p>
    <div id="anCount" class="an-count-val">0</div>
    <div class="an-btn-row">
      <button onclick="anReset()" class="an-btn-outline">↺ Reset</button>
      <button onclick="anInc()" class="an-btn-filled">+ Increment</button>
    </div>
  </div>
</div>`,
    css: `.an-compose-scaffold {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #09090b;
  color: #fff;
  border-radius: 16px;
  overflow: hidden;
  max-width: 380px;
  margin: 16px auto;
  border: 1px solid #27272a;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.an-topbar {
  background: #16a34a;
  padding: 14px 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.an-badge {
  background: rgba(0,0,0,0.3);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
}
.an-body {
  padding: 36px 20px;
  text-align: center;
}
.an-sub {
  color: #a1a1aa;
  font-size: 11px;
  letter-spacing: 1.5px;
  margin: 0 0 8px 0;
}
.an-count-val {
  font-size: 64px;
  font-weight: 900;
  color: #4ade80;
  margin-bottom: 24px;
}
.an-btn-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.an-btn-outline {
  background: transparent;
  border: 1px solid #3f3f46;
  color: #e4e4e7;
  padding: 10px 18px;
  border-radius: 9999px;
  cursor: pointer;
  font-weight: 700;
}
.an-btn-filled {
  background: #16a34a;
  border: none;
  color: #fff;
  padding: 10px 22px;
  border-radius: 9999px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);
}`,
    js: `let count = 0;
function anInc() {
  count++;
  document.getElementById('anCount').innerText = count;
}
function anReset() {
  count = 0;
  document.getElementById('anCount').innerText = count;
}`,
    createdAt: 'Android 14'
  },
  {
    id: 'an_proj_2',
    name: '2_Material_Layout.xml',
    lang: 'Kotlin',
    code: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp">

    <com.google.android.material.card.MaterialCardView
        android:id="@+id/cardView"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        app:cardCornerRadius="16dp"
        app:cardElevation="6dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="20dp">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Material 3 Android Layout"
                android:textAppearance="?attr/textAppearanceHeadlineSmall"/>

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="8dp"
                android:text="Native Android layout XML with ConstraintLayout"/>

        </LinearLayout>
    </com.google.android.material.card.MaterialCardView>

</androidx.constraintlayout.widget.ConstraintLayout>`,
    html: `<div class="xml-card-wrap">
  <div class="xml-card">
    <div class="xml-badge">XML LAYOUT</div>
    <h3>Material Card View</h3>
    <p>ConstraintLayout hierarchy with dynamic elevation.</p>
  </div>
</div>`,
    css: `.xml-card-wrap { max-width: 360px; margin: 15px auto; }
.xml-card { background: #18181b; padding: 20px; border-radius: 16px; border: 1px solid #27272a; box-shadow: 0 8px 24px rgba(0,0,0,0.5); color: #fff; }
.xml-badge { font-size: 10px; font-weight: 800; color: #4ade80; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.3); padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }`,
    js: `console.log("Layout loaded");`,
    createdAt: 'Android 14'
  },
  {
    id: 'an_proj_3',
    name: '3_ViewModel_Flow.kt',
    lang: 'Kotlin',
    code: `package com.myapp.android

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class CounterViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(0)
    val uiState: StateFlow<Int> = _uiState

    fun increment() {
        viewModelScope.launch {
            _uiState.value += 1
        }
    }
}`,
    html: `<div class="vm-wrap">
  <div class="vm-top">Android ViewModel & StateFlow</div>
  <div class="vm-body">
    <p>Lifecycle-aware reactive architecture</p>
    <div id="vmFlowVal" class="vm-val">StateFlow: 0</div>
    <button onclick="incVm()" class="vm-btn">Dispatch Intent</button>
  </div>
</div>`,
    css: `.vm-wrap { background: #0f172a; color: #fff; border-radius: 12px; overflow: hidden; max-width: 360px; margin: 15px auto; border: 1px solid #1e293b; }
.vm-top { background: #0284c7; padding: 12px 16px; font-weight: 700; }
.vm-body { padding: 20px; text-align: center; }
.vm-val { font-size: 24px; font-weight: 800; color: #38bdf8; margin: 12px 0; }
.vm-btn { background: #0284c7; border: none; color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }`,
    js: `let s = 0; function incVm() { s++; document.getElementById('vmFlowVal').innerText = 'StateFlow: ' + s; }`,
    createdAt: 'Android 14'
  },
  {
    id: 'an_proj_4',
    name: '4_RecyclerView_List.kt',
    lang: 'Kotlin',
    code: `package com.myapp.android

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView

class UserAdapter(private val users: List<String>) : RecyclerView.Adapter<UserAdapter.ViewHolder>() {
    class ViewHolder(val binding: ItemRowBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemRowBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.binding.titleText.text = users[position]
    }

    override fun getItemCount(): Int = users.size
}`,
    html: `<div class="rv-box">
  <div class="rv-top">RecyclerView Android</div>
  <div class="rv-list">
    <div class="rv-item"><span>👤 Android User #1</span><span class="rv-tag">Online</span></div>
    <div class="rv-item"><span>👤 Android User #2</span><span class="rv-tag">Active</span></div>
    <div class="rv-item"><span>👤 Android User #3</span><span class="rv-tag">Idle</span></div>
  </div>
</div>`,
    css: `.rv-box { background: #18181b; color: #fff; max-width: 360px; margin: 15px auto; border-radius: 12px; overflow: hidden; }
.rv-top { background: #15803d; padding: 12px 16px; font-weight: 700; }
.rv-list { padding: 8px; display: flex; flex-direction: column; gap: 6px; }
.rv-item { background: #27272a; padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; font-size: 13px; }
.rv-tag { background: #15803d; padding: 2px 8px; border-radius: 4px; font-size: 10px; }`,
    js: `console.log("Recycler loaded");`,
    createdAt: 'Android 14'
  },
  {
    id: 'an_proj_5',
    name: '5_Room_Database.kt',
    lang: 'Kotlin',
    code: `package com.myapp.android

import androidx.room.*

@Entity(tableName = "notes")
data class Note(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Dao
interface NoteDao {
    @Query("SELECT * FROM notes ORDER BY timestamp DESC")
    suspend fun getAllNotes(): List<Note>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: Note)
}`,
    html: `<div class="room-wrap">
  <div class="room-top">Room Database (SQLite)</div>
  <div class="room-content">
    <ul class="room-notes" id="notesList">
      <li>📝 Local SQLite Cache Initialized</li>
      <li>⚡ Fast DAO Coroutine Queries</li>
    </ul>
    <button class="room-btn" onclick="addNote()">+ Insert Note Entity</button>
  </div>
</div>`,
    css: `.room-wrap { background: #09090b; color: #fff; max-width: 360px; margin: 15px auto; border-radius: 12px; overflow: hidden; border: 1px solid #27272a; }
.room-top { background: #b45309; padding: 12px 16px; font-weight: 700; }
.room-content { padding: 14px; }
.room-notes { list-style: none; padding: 0; margin: 0 0 14px 0; display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
.room-notes li { background: #18181b; padding: 8px 12px; border-radius: 6px; }
.room-btn { background: #b45309; border: none; color: #fff; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; }`,
    js: `function addNote() {
  const li = document.createElement('li');
  li.innerText = '📝 Entity #' + (document.getElementById('notesList').children.length + 1) + ' Saved';
  document.getElementById('notesList').appendChild(li);
}`,
    createdAt: 'Android 14'
  },
  {
    id: 'an_proj_6',
    name: '6_Retrofit_Api.kt',
    lang: 'Kotlin',
    code: `package com.myapp.android

import retrofit2.http.GET

interface ApiService {
    @GET("api/v1/feed")
    suspend fun getFeed(): List<FeedItem>
}`,
    html: `<div class="retro-box">
  <div class="retro-top">Retrofit2 HTTP Client</div>
  <p>Status: <span style="color:#4ade80">Connected 200 OK</span></p>
</div>`,
    css: `.retro-box { background: #1e1b4b; color: #fff; padding: 16px; max-width: 340px; margin: 15px auto; border-radius: 12px; text-align: center; }
.retro-top { font-weight: 700; color: #818cf8; margin-bottom: 8px; }`,
    js: `console.log("Retrofit ready");`,
    createdAt: 'Android 14'
  },
  {
    id: 'an_proj_7',
    name: '7_Notification_Worker.kt',
    lang: 'Kotlin',
    code: `package com.myapp.android

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        // Periodic background worker
        return Result.success()
    }
}`,
    html: `<div class="work-box">
  <div class="work-top">WorkManager Background Sync</div>
  <button class="work-btn" onclick="alert('WorkManager enqueued!')">Schedule Sync</button>
</div>`,
    css: `.work-box { background: #141420; color: #fff; padding: 18px; max-width: 340px; margin: 15px auto; border-radius: 12px; text-align: center; }
.work-top { font-weight: 700; margin-bottom: 12px; }
.work-btn { background: #2563eb; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; }`,
    js: `console.log("Worker ready");`,
    createdAt: 'Android 14'
  },
  {
    id: 'an_proj_8',
    name: '8_CameraX_Vision.kt',
    lang: 'Kotlin',
    code: `package com.myapp.android

import androidx.camera.core.CameraSelector
import androidx.camera.lifecycle.ProcessCameraProvider

fun bindCamera(cameraProvider: ProcessCameraProvider) {
    val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
}`,
    html: `<div class="cam-box">
  <div class="cam-top">CameraX Preview</div>
  <div class="cam-view">📷 Live Camera Viewport</div>
</div>`,
    css: `.cam-box { background: #000; color: #fff; max-width: 340px; margin: 15px auto; border-radius: 12px; overflow: hidden; text-align: center; }
.cam-top { background: #374151; padding: 10px; font-weight: 700; font-size: 13px; }
.cam-view { height: 120px; display: flex; align-items: center; justify-content: center; color: #9ca3af; }`,
    js: `console.log("CameraX active");`,
    createdAt: 'Android 14'
  },
  {
    id: 'an_proj_9',
    name: '9_Navigation_Graph.kt',
    lang: 'Kotlin',
    code: `package com.myapp.android

import androidx.compose.runtime.Composable
import androidx.navigation.compose.*

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "home") {
        composable("home") { /* Home */ }
        composable("details") { /* Details */ }
    }
}`,
    html: `<div class="nav-box">
  <div class="nav-top">Jetpack NavHost</div>
  <p>Current: <b id="navRoute">home</b></p>
  <button class="nav-btn" onclick="toggleRoute()">Navigate Route</button>
</div>`,
    css: `.nav-box { background: #18181b; color: #fff; padding: 18px; max-width: 340px; margin: 15px auto; border-radius: 12px; text-align: center; }
.nav-top { font-weight: 700; margin-bottom: 8px; color: #38bdf8; }
.nav-btn { background: #38bdf8; color: #000; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; }`,
    js: `let r = 'home'; function toggleRoute() { r = r === 'home' ? 'details' : 'home'; document.getElementById('navRoute').innerText = r; }`,
    createdAt: 'Android 14'
  },
  {
    id: 'an_proj_10',
    name: '10_Sensor_Compass.kt',
    lang: 'Kotlin',
    code: `package com.myapp.android

import android.hardware.Sensor
import android.hardware.SensorEventListener
import android.hardware.SensorManager

class CompassActivity : SensorEventListener {
    // Accelerometer & Magnetic Field Sensor
}`,
    html: `<div class="sensor-box">
  <div class="sensor-top">Hardware SensorManager</div>
  <div class="compass-disc" id="compDisc">🧭</div>
  <button class="sensor-btn" onclick="spinCompass()">Calibrate</button>
</div>`,
    css: `.sensor-box { background: #0f172a; color: #fff; padding: 18px; max-width: 340px; margin: 15px auto; border-radius: 12px; text-align: center; }
.sensor-top { font-weight: 700; color: #4ade80; margin-bottom: 12px; }
.compass-disc { font-size: 48px; margin-bottom: 12px; transition: transform 0.6s ease; }
.sensor-btn { background: #15803d; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; }`,
    js: `let deg = 0; function spinCompass() { deg += 90; document.getElementById('compDisc').style.transform = 'rotate(' + deg + 'deg)'; }`,
    createdAt: 'Android 14'
  }
];

export const DEFAULT_ANDROID_TUTORIALS: TutorialItem[] = DEFAULT_TUTORIALS;

export const DEFAULT_ANDROID_BLOCKS: BlockItem[] = DEFAULT_BLOCKS;
