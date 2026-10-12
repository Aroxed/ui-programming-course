import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun TaskScreen() {
    var completed by remember { mutableStateOf(false) }

    Column(modifier = Modifier.padding(24.dp)) {
        Text(
            text = "Перевірити обладнання в аудиторії",
            style = MaterialTheme.typography.headlineSmall
        )
        Text(if (completed) "Виконано" else "Активне")

        Button(onClick = { completed = !completed }) {
            Text(if (completed) "Повернути" else "Позначити виконаним")
        }
    }
}
