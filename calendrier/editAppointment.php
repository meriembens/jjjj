<?php
include 'connect.php';

// If this is a GET request and an appointment ID is passed, fetch the data
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['appointment_id'])) {
    $appointment_id = $_GET['appointment_id'];

    // Fetch the appointment data from the database
    $query = "SELECT * FROM appointments WHERE appointment_id = ?";
    if ($stmt = $conn->prepare($query)) {
        $stmt->bind_param("i", $appointment_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $appointment = $result->fetch_assoc();
            // Populate your form with this appointment data
        } else {
            echo "Appointment not found!";
        }
    }
}

// If the form is submitted (POST request), update the appointment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $appointment_id = $_POST['appointment_id'];  // The appointment ID from the form
    $prenom_patient = $_POST['prenom_patient'];
    $nom_patient = $_POST['nom_patient'];
    $phone = $_POST['phone'];
    $motif = $_POST['motif'];
    $nom_docteur = $_POST['nom_docteur'];
    $date = $_POST['date'];
    $time = $_POST['time'];
    
    // Split the date into year, month, and day
    list($year, $month, $day) = explode('-', $date);

    // French month names mapping
    $monthMap = [
        '01' => 'Janvier', '02' => 'Février', '03' => 'Mars', '04' => 'Avril', '05' => 'Mai', '06' => 'Juin',
        '07' => 'Juillet', '08' => 'Août', '09' => 'Septembre', '10' => 'Octobre', '11' => 'Novembre', '12' => 'Décembre'
    ];

    // Convert the month number to its French name
    $monthName = isset($monthMap[$month]) ? $monthMap[$month] : $month;  // Default to numeric month if not found

    // Database update query
    $query = "UPDATE appointments SET prenom_patient = ?, nom_patient = ?, phone = ?, motif = ?, nom_docteur = ?, date = ?, heure = ? WHERE appointment_id = ?";

    if ($stmt = $conn->prepare($query)) {
        $stmt->bind_param("sssssssi", $prenom_patient, $nom_patient, $phone, $motif, $nom_docteur, $date, $time, $appointment_id);

        if ($stmt->execute()) {
            // Redirect to days.html with the right parameters in the URL
            // Note that monthName should be passed as French month name
            header("Location: /calendrier/days.html?day={$day}&month={$monthName}&year={$year}");
            exit(); // Ensure the script stops executing after redirection
        } else {
            echo "Erreur lors de la modification : " . $stmt->error;
        }
    }
}
?>
