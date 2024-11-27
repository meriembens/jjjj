<?php
include 'connect'; // Assuming the connection to the database is established here

// Check for a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the doctor and date from the request
    $doctor = $_POST['doctor'];
    $date = $_POST['date'];

    if (empty($doctor) || empty($date)) {
        echo json_encode(['error' => 'Doctor and date are required.']);
        exit;
    }

    // Fetch booked slots for the given doctor and date
    $stmt = $conn->prepare("SELECT time FROM appointments WHERE nom_docteur = ? AND date = ?");
    $stmt->bind_param("ss", $doctor, $date);
    $stmt->execute();
    $result = $stmt->get_result();

    $bookedSlots = [];
    while ($row = $result->fetch_assoc()) {
        $bookedSlots[] = $row['time'];
    }

    echo json_encode($bookedSlots);
    exit;
}

// Book an appointment
if (isset($_POST['book'])) {
    $doctor = $_POST['nom_docteur'];
    $date = $_POST['date'];
    $time = $_POST['time'];

    if (empty($doctor) || empty($date) || empty($time)) {
        echo "All fields are required.";
        exit;
    }

    // Check if the slot is already booked
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM appointments WHERE nom_docteur = ? AND date = ? AND time = ?");
    $stmt->bind_param("sss", $doctor, $date, $time);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if ($row['count'] > 0) {
        echo "This time slot is already booked. Please choose another.";
    } else {
        // Insert the new appointment
        $stmt = $conn->prepare("INSERT INTO appointments (nom_docteur, date, time) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $doctor, $date, $time);
        if ($stmt->execute()) {
            echo "Appointment booked successfully!";
        } else {
            echo "Failed to book the appointment.";
        }
    }

    exit;
}
?>
