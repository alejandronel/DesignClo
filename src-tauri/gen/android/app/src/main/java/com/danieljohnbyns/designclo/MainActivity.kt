package com.danieljohnbyns.designclo

import android.annotation.SuppressLint
import android.os.Bundle
import android.os.Environment
import android.webkit.JavascriptInterface
import android.webkit.MimeTypeMap
import android.webkit.WebView
import android.widget.Toast
import android.media.MediaScannerConnection
import android.view.KeyEvent
import java.io.File
import java.io.FileOutputStream

class MainActivity : TauriActivity() {
	private lateinit var wv: WebView

	override fun onWebViewCreate(webView: WebView) {
		wv = webView

		// Add JavaScript interface for permission checking
		wv.addJavascriptInterface(WebAppInterface(), "AndroidInterface");
	}

	inner class WebAppInterface {
		@JavascriptInterface
		fun toast(message: String) {
			runOnUiThread {
				Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
			}
		}

		@JavascriptInterface
        fun saveImage(fileName: String, base64: String): Boolean {
            val directory = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
            val designCloDir = File(directory, "DesignClo")
            if (!designCloDir.exists()) {
                designCloDir.mkdirs()
            }
            val file = File(designCloDir, fileName)

            return try {
                FileOutputStream(file).use { outputStream ->
                    // Remove data URI prefix if present
                    val pureBase64 = base64.substringAfterLast(",", base64)
                    val decodedBytes = android.util.Base64.decode(pureBase64, android.util.Base64.DEFAULT)
                    outputStream.write(decodedBytes)
                }
                scanMediaFile(file) // Notify media scanner
                true
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }

        private fun scanMediaFile(file: File) {
            val mimeType = MimeTypeMap.getSingleton()
                .getMimeTypeFromExtension(file.extension) ?: "image/*"
            
            MediaScannerConnection.scanFile(
                this@MainActivity,
                arrayOf(file.absolutePath),
                arrayOf(mimeType),
                null
            )
        }
	}

	fun invokeAndroidBack() {
		wv.evaluateJavascript(/* script = */ """
			try {
				window.androidBackCallback()
			} catch (_) {
				true
			}
		""".trimIndent()) { result ->
			if (result == "true") {
				super.onBackPressed();
			}
		}
	}

	@SuppressLint("MissingSuperCall", "SetTextI18n")
	@Deprecated("")
	override fun onBackPressed() {
		invokeAndroidBack();
	}

	override fun dispatchKeyEvent(event: KeyEvent): Boolean {
		if (event.keyCode == KeyEvent.KEYCODE_BACK && event.action == KeyEvent.ACTION_DOWN) {
				if (wv.canGoBack()) {
						invokeAndroidBack();
						return true
				}
		}
		return super.dispatchKeyEvent(event)
	}
}