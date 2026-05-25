import React, { useState } from "react";
import { Check, Copy, FileCode, Code, HelpCircle, ArrowRight } from "lucide-react";

export function KotlinCodeViewer() {
  const [activeTab, setActiveTab] = useState<"screen" | "activity" | "gradle">("screen");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeMainScreen = `package com.example.shrimpcounter.ui

import android.content.Context
import android.graphics.Bitmap
import androidx.camera.core.CameraSelector
import androidx.camera.core.FocusMeteringAction
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.example.shrimpcounter.viewmodel.ShrimpViewModel
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    viewModel: ShrimpViewModel,
    onCaptureClick: () -> Unit,
    onSaveToGalleryClick: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    val shrimpCount by viewModel.shrimpCount.collectAsState()
    val accuracy by viewModel.accuracy.collectAsState()
    val isAnalyzing by viewModel.isAnalyzing.collectAsState()
    val capturedBitmap by viewModel.capturedBitmap.collectAsState()
    val isCameraActive by viewModel.isCameraActive.collectAsState()

    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
    var imageCapture: ImageCapture? by remember { mutableStateOf(null) }
    val cameraExecutor: ExecutorService = remember { Executors.newSingleThreadExecutor() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        text = "Shrimp Counter",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimary
                    ) 
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Region 1: Image Viewport (Chế độ Xem thử Máy ảnh real-time CameraX hoặc Hiển thị Ảnh đã chụp)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFFF3F4F6))
                    .border(2.dp, Color(0xFFE5E7EB), RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                if (isCameraActive) {
                    // Hiển thị Feed CameraX Real-time
                    AndroidView(
                        factory = { ctx ->
                            val previewView = PreviewView(ctx).apply {
                                scaleType = PreviewView.ScaleType.FILL_CENTER
                            }
                            
                            cameraProviderFuture.addListener({
                                val cameraProvider = cameraProviderFuture.get()
                                val preview = Preview.Builder().build().also {
                                    it.setSurfaceProvider(previewView.surfaceProvider)
                                }
                                
                                imageCapture = ImageCapture.Builder()
                                    .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                                    .build()

                                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                                try {
                                    cameraProvider.unbindAll()
                                    
                                    // Liên kết vòng đời và cài đặt Auto-Focus cấu hình chuyên sâu
                                    val camera = cameraProvider.bindToLifecycle(
                                        lifecycleOwner,
                                        cameraSelector,
                                        preview,
                                        imageCapture
                                    )
                                    
                                    // Tự động kích hoạt lấy nét liên tục (Continuous auto-focus) và đo sáng điểm trung tâm
                                    // Giúp lấy nét cực cận siêu nét để thấy rõ ấu trùng tôm dẹt
                                    val cameraControl = camera.cameraControl
                                    val factory = previewView.meteringPointFactory
                                    val centerPoint = factory.createPoint(previewView.width / 2f, previewView.height / 2f)
                                    val action = FocusMeteringAction.Builder(centerPoint)
                                        .enableAutoCancel() // Tự động lấy nét lại sau khi người dùng bám tay
                                        .build()
                                    cameraControl.startFocusAndMetering(action)
                                    
                                } catch (exc: Exception) {
                                    exc.printStackTrace()
                                }
                            }, ContextCompat.getMainExecutor(ctx))
                            
                            previewView
                        },
                        modifier = Modifier.fillMaxSize()
                    )

                    // Overlay chỉ dẫn đo tiêu cự để lấy nét tốt hơn
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        contentAlignment = Alignment.BottomCenter
                    ) {
                        FloatingActionButton(
                            onClick = {
                                val capture = imageCapture ?: return@FloatingActionButton
                                capture.takePicture(
                                    cameraExecutor,
                                    object : ImageCapture.OnImageCapturedCallback() {
                                        override fun onCaptureSuccess(image: ImageProxy) {
                                            val bitmap = image.toBitmap() // Convert sang định dạng Bitmap Android
                                            viewModel.setCapturedImage(bitmap)
                                            viewModel.analyzeShrimpImage(bitmap)
                                            viewModel.setCameraActive(false)
                                            image.close()
                                        }
                                    }
                                )
                            },
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ) {
                            Icon(Icons.Default.CameraAlt, contentDescription = "Bắt hình")
                        }
                    }

                } else if (capturedBitmap != null) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        Image(
                            bitmap = capturedBitmap!!.asImageBitmap(),
                            contentDescription = "Chụp khay tôm",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                        
                        // Nút lưu ảnh vào bộ sưu tập
                        Button(
                            onClick = onSaveToGalleryClick,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xCC1E293B),
                                contentColor = Color.White
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Save,
                                contentDescription = "Lưu thư viện",
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Lưu thư viện", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                } else {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = "Máy ảnh",
                            tint = Color(0xFF9CA3AF),
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Chụp ảnh khay tôm để bắt đầu",
                            color = Color(0xFF4B5563),
                            fontSize = 16.sp,
                            textAlign = TextAlign.Center
                        )
                    }
                }
                
                if (isAnalyzing) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color(0x80000000)),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Region 2: Results Display Panel
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFFEFF6FF)
                )
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Số lượng tôm phát hiện",
                        fontSize = 14.sp,
                        color = Color(0xFF2563EB),
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$shrimpCount",
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E3A8A)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        color = Color(0xFFDBEAFE),
                        shape = RoundedCornerShape(50),
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = "Độ chính xác",
                                tint = Color(0xFF2563EB),
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Độ chính xác: $accuracy%",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF2563EB)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Region 3: Capture Action Button
            Button(
                onClick = onCaptureClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(28.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF2563EB)
                )
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = "Chụp ảnh"
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Chụp ảnh ngay",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}`;

  const codeMainActivity = `package com.example.shrimpcounter

import android.Manifest
import android.content.ContentValues
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import com.example.shrimpcounter.ui.MainScreen
import com.example.shrimpcounter.ui.theme.ShrimpCounterTheme
import com.example.shrimpcounter.viewmodel.ShrimpViewModel
import java.io.OutputStream

class MainActivity : ComponentActivity() {

    private val viewModel: ShrimpViewModel by viewModels()

    // Đăng ký camera permission launcher chuẩn Jetpack Compose & Android Activity Contracts
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            launchCameraX()
        } else {
            Toast.makeText(this, "Yêu cầu quyền truy cập camera để chụp khay tôm và đếm", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ShrimpCounterTheme {
                MainScreen(
                    viewModel = viewModel,
                    onCaptureClick = { checkAndRequestCameraPermission() },
                    onSaveToGalleryClick = { saveCurrentImageToGallery() }
                )
            }
        }
    }

    private fun checkAndRequestCameraPermission() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED -> {
                launchCameraX()
            }
            else -> {
                requestPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

    // Kích hoạt camera hoạt động trực tiếp bên trong Viewport của MainScreen bằng CameraX
    private fun launchCameraX() {
        viewModel.setCameraActive(true)
    }

    // Hàm lưu ảnh khay tôm giống vào Bộ sưu tập thiết bị Android
    private fun saveCurrentImageToGallery() {
        val bitmap = viewModel.capturedBitmap.value
        if (bitmap == null) {
            Toast.makeText(this, "Chưa có hình ảnh khay tôm nào để lưu!", Toast.LENGTH_SHORT).show()
            return
        }

        val filename = "Shrimp_Counter_\${System.currentTimeMillis()}.jpg"
        var fos: OutputStream? = null
        val contentValues = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
            put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.MediaColumns.RELATIVE_PATH, "DCIM/ShrimpCounter")
            }
        }

        try {
            val contentResolver = applicationContext.contentResolver
            val imageUri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
            if (imageUri != null) {
                fos = contentResolver.openOutputStream(imageUri)
                bitmap.compress(Bitmap.CompressFormat.JPEG, 95, fos!!)
                fos.flush()
                Toast.makeText(this, "Đã lưu ảnh khay tôm vào Bộ sưu tập thành công!", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(this, "Không thể tạo tập tin ảnh mới.", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Lỗi khi lưu ảnh: \${e.localizedMessage}", Toast.LENGTH_LONG).show()
        } finally {
            fos?.close()
        }
    }
}`;

  const codeGradle = `// build.gradle.kts (Module: app)
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.shrimpcounter"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.shrimpcounter"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables { useSupportLibrary = true }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

dependencies {
    // Jetpack Compose
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    
    // Lifecycle & Coroutines
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

    // Retrofit hoặc HTTP Client kết nối tới API đếm tôm
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")

    // Android CameraX Library Core & Preview dependencies
    val cameraXVersion = "1.3.1"
    implementation("androidx.camera:camera-core:\${cameraXVersion}")
    implementation("androidx.camera:camera-camera2:\${cameraXVersion}")
    implementation("androidx.camera:camera-lifecycle:\${cameraXVersion}")
    implementation("androidx.camera:camera-view:\${cameraXVersion}")
    implementation("androidx.camera:camera-extensions:\${cameraXVersion}")
}`;

  const getCodeText = () => {
    if (activeTab === "screen") return codeMainScreen;
    if (activeTab === "activity") return codeMainActivity;
    return codeGradle;
  };

  return (
    <div id="kotlin-view-panel" className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full font-sans">
      {/* Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <FileCode size={20} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm md:text-base">Mã nguồn Kotlin & Compose</h3>
            <p className="text-slate-400 text-xs">Cấu trúc chuẩn Jetpack Compose Material 3</p>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={() => handleCopy(getCodeText())}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:indigo-700 text-white text-xs font-medium cursor-pointer transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-300 animate-bounce" /> : <Copy size={14} />}
          {copied ? "Đã Sao Chép!" : "Sao chép Code"}
        </button>
      </div>

      {/* Tabs list */}
      <div className="bg-slate-900 border-b border-slate-800 flex px-4 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("screen")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "screen"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          MainScreen.kt (Giao diện)
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "activity"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          MainActivity.kt (Logic)
        </button>
        <button
          onClick={() => setActiveTab("gradle")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "gradle"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          build.gradle.kts (Thư viện)
        </button>
      </div>

      {/* Code Textarea / Viewer Block */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/40">
        <pre className="font-mono text-[11px] md:text-xs leading-relaxed text-slate-300 whitespace-pre-wrap select-all select-text">
          <code>{getCodeText()}</code>
        </pre>
      </div>

      {/* Developer Instruction Footer */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 text-slate-400 text-xs leading-relaxed flex items-start gap-2.5">
        <HelpCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-slate-300 font-medium font-sans">Sử dụng trong Android Studio:</p>
          <ol className="list-decimal pl-4 space-y-1 text-slate-400">
            <li>Tạo một project Android mới (Empty Compose Activity).</li>
            <li>Copy nội dung <strong className="text-indigo-400">MainScreen.kt</strong> bỏ vào thư mục giao diện của bạn.</li>
            <li>Trong <strong className="text-indigo-400">MainActivity.kt</strong>, đăng ký lấy quyền Camera và truyền callback hiển thị.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
