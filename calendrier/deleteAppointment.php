<?php
include 'connect.php';

// Check if the appointment ID is set in POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['appointment_id'])) {
    $appointment_id = $_POST['appointment_id'];

    // Query to delete the appointment from the database
    $query = "DELETE FROM appointments WHERE appointment_id = ?";

    if ($stmt = $conn->prepare($query)) {
        $stmt->bind_param("i", $appointment_id);
        if ($stmt->execute()) {
            // Success: Return a success response
            echo json_encode(['success' => true]);
        } else {
            // Error: Return error message
            echo json_encode(['success' => false, 'message' => 'Error deleting appointment!']);
        }
    } else {
        // Error: Query preparation failed
        echo json_encode(['success' => false, 'message' => 'Database query failed!']);
    }
} else {
    // If POST request does not contain appointment_id
    echo json_encode(['success' => false, 'message' => 'Appointment ID not provided']);
}
?>
