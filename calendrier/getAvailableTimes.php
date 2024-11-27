<?php
include 'connect.php'; // Make sure this points to your DB connection file

// Enable error reporting for debugging (disable in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Check if the required data is provided via POST (AJAX request)
if (isset($_POST['nom_docteur']) && isset($_POST['date'])) {
    $nom_docteur = $_POST['nom_docteur'];
    $date = $_POST['date'];

    // Define all available slots
    $all_slots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00'];

    // Fetch booked slots from the database
    $query = $conn->prepare("SELECT heure FROM appointments WHERE nom_docteur = ? AND date = ?");
    $query->bind_param("ss", $nom_docteur, $date);
    $query->execute();
    $result = $query->get_result();

    $booked_slots = [];
    while ($row = $result->fetch_assoc()) {
        $booked_slots[] = $row['heure'];
    }
    echo '<pre>';
    print_r($booked_slots);
    echo '</pre>';
    
    // Debugging: Check the value of $booked_slots
    error_log("Booked Slots: " . var_export($booked_slots, true)); // Logs the content of booked_slots

    // Calculate available slots by removing booked slots
    $available_slots = array_diff($all_slots, $booked_slots);

    // Debugging: Check the value of $available_slots
    error_log("Available Slots: " . var_export($available_slots, true)); // Logs the content of available_slots

    // Return the available slots as JSON
    echo json_encode(array_values($available_slots));
} else {
    // If data is missing, return an empty array or error
    echo json_encode([]);
}
?>
