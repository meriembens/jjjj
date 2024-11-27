// Mapping doctor specialties (only declared once)
const doctorSpecialties = {
    "Consultation générale": ["Dr Keciour Nesma", "Dr Belhedid Ibtissem", "Dr Bensalah Meriem", "Dr Guerroumi Lynda", "Dr Bouchetara Ryane"],
    "Blanchiment dentaire": ["Dr Keciour Nesma", "Dr Belhedid Ibtissem", "Dr Bensalah Meriem"],
    "Détartrage et nettoyage": ["Dr Keciour Nesma", "Dr Belhedid Ibtissem", "Dr Guerroumi Lynda"],
    "Orthodontie": ["Dr Keciour Nesma", "Dr Bensalah Meriem", "Dr Bouchetara Ryane"],
    "Soin des caries": ["Dr Belhedid Ibtissem", "Dr Bensalah Meriem", "Dr Guerroumi Lynda"],
    "Implant dentaire": ["Dr Bensalah Meriem", "Dr Guerroumi Lynda", "Dr Bouchetara Ryane"],
    "Traitement de canal": ["Dr Bensalah Meriem", "Dr Guerroumi Lynda"],
    "Prothèse dentaire": ["Dr Bensalah Meriem", "Dr Guerroumi Lynda", "Dr Bouchetara Ryane"]
};

// Function to update doctor options based on the selected motif
function updateDoctorsBasedOnMotif() {
    const motif = document.getElementById('edit-motif').value; // Get the selected motif
    const doctorSelect = document.getElementById('edit-nom_docteur'); // Get the doctor select dropdown

    // Clear the current doctor options
    doctorSelect.innerHTML = '<option value="" disabled selected>Choisir un médecin</option>';

    // Check if there are doctors available for the selected motif
    if (motif && doctorSpecialties[motif]) {
        doctorSpecialties[motif].forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor; // Set the value to the doctor's name
            option.textContent = doctor; // Display the doctor's name
            doctorSelect.appendChild(option); // Add the option to the select
        });
    }
}

// Attach the change event listener to the motif dropdown
document.getElementById('edit-motif')?.addEventListener('change', updateDoctorsBasedOnMotif);

// Call the function once to populate the doctors on page load
updateDoctorsBasedOnMotif();

// Initialize global reference for current appointment being edited
let currentAppointment = null;

// Define month-to-index map and other constants
const monthsMap = {
    Janvier: 0, Février: 1, Mars: 2, Avril: 3, Mai: 4, Juin: 5,
    Juillet: 6, Août: 7, Septembre: 8, Octobre: 9, Novembre: 10, Décembre: 11
};

const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];

const doctorColors = {
    "Dr Belhedid Ibtissem": "#FF7F7F",
    "Dr Bensalah Meriem": "#87CEEB",
    "Dr Guerroumi Lynda": "#9370DB",
    "Dr Bouchetara Ryane": "#FFCC00",
    "Dr Keciour Nesma": "#98FB98"
};

// Get day, month, and year from URL
const urlParams = new URLSearchParams(window.location.search);
const day = parseInt(urlParams.get('day'));
const monthName = urlParams.get('month');
const year = parseInt(urlParams.get('year'));

const monthIndex = monthsMap[monthName]; 
const date = new Date(year, monthIndex, day);

// Populate page with day, month, year, and weekday
document.getElementById('day').textContent = day;
document.getElementById('month').textContent = `${monthName}`;
document.getElementById('year').textContent = year;
document.getElementById('weekday').textContent = dayNames[date.getDay()];

// Populate the hours grid
function populateHours() {
    const hoursGrid = document.getElementById('hours');
    hoursGrid.innerHTML = "";
    timeSlots.forEach(slot => {
        const hourBlock = document.createElement('div');
        hourBlock.classList.add('hour-block');
        hourBlock.innerHTML = `
            <div class="hour-label-container">
                <span class="hour-label">${slot}</span>
                <div class="hour-line"></div>
            </div>
            <div class="hour-appointments" id="appointments-${slot}"></div>
        `;
        hoursGrid.appendChild(hourBlock);
    });
}

// Fetch appointments from the server
function fetchAppointments() {
    fetch('fetchAppointments.php')
        .then(response => response.json())
        .then(appointments => {
            displayAppointments(appointments);
        })
        .catch(error => console.error('Error fetching appointments:', error));
}


// Display appointments in the hours grid
function displayAppointments(appointments) {
    console.log("Fetched appointments:", appointments);  // Debugging log

    const selectedDoctor = document.getElementById('filters').value;
    const filteredAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.start);
        const matchesDoctor = selectedDoctor === "tous" || appointment.doctor === selectedDoctor;
        return matchesDoctor && appointmentDate.getFullYear() === year && appointmentDate.getMonth() === monthIndex && appointmentDate.getDate() === day;
    });

    if (filteredAppointments.length === 0) {
        console.log("No appointments found for this day and doctor.");
    }

    populateHours();  // Make sure this function runs

    filteredAppointments.forEach(appointment => {
        console.log("Rendering appointment:", appointment);  // Debugging log

        const appointmentDate = new Date(appointment.start);
        const appointmentTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const appointmentElement = document.createElement('div');
        appointmentElement.classList.add('appointment');
        appointmentElement.style.backgroundColor = doctorColors[appointment.doctor] || '#ffffff';
        appointmentElement.innerHTML = `
            <div class="appointment-header">
                <div class="appointment-title">${appointment.title}</div>
            </div>
            <div class="appointment-doctor">${appointment.doctor}</div>
            <div class="appointment-motif">${appointment.motif}</div>
            <div class="appointment-phone">${appointment.phone}</div>
            
        `;

        // Set the ID as a data attribute on the appointment element
        appointmentElement.setAttribute('data-id', appointment.appointment_id);

        // Add event listener to open the edit form when the appointment is clicked
        appointmentElement.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-id');
            console.log('Appointment ID clicked:', appointmentId);
            openEditForm(appointment);
        });

    

        const appointmentSlot = document.getElementById(`appointments-${appointmentTime}`);
        if (appointmentSlot) {
            appointmentSlot.appendChild(appointmentElement);
        } else {
            console.error('No slot found for time:', appointmentTime);
        }
    });
}

// Event listener for the "Supprimer le Rendez-vous" button
document.getElementById('delete-appointment')?.addEventListener('click', function() {
    const appointmentId = document.getElementById('appointment_id').value;  // Get appointment ID from hidden input
    if (appointmentId) {
        console.log("Deleting appointment with ID:", appointmentId);  // Debugging log
        deleteAppointment(appointmentId);
    } else {
        alert("Aucun rendez-vous sélectionné pour la suppression.");
    }
});

function deleteAppointment(appointmentId) {
    // Confirm if the user wants to delete the appointment
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?')) {
        // Prepare the data to be sent in the POST request
        const formData = new FormData();
        formData.append('appointment_id', appointmentId);

        // Send the delete request to the server
        fetch('deleteAppointment.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // If deletion is successful, remove the appointment from the UI
                const appointmentElement = document.querySelector(`[data-id='${appointmentId}']`);
                if (appointmentElement) {
                    appointmentElement.remove();
                }

                // Hide the edit appointment form after successful deletion
                
                document.getElementById('edit-form-container').style.display = 'none';
                 

                // Alert success
                alert('Rendez-vous supprimé avec succès');
            } else {
                // In case of error, show an alert message
                alert('Erreur lors de la suppression du rendez-vous: ' + (data.message || 'Unknown error'));
            }
        })
    }
}




// Open the edit form and populate it with the selected appointment's data
function openEditForm(appointment) {
    currentAppointment = appointment;

    document.getElementById('edit-prenom').value = appointment.prenom;
    document.getElementById('edit-nom').value = appointment.nom;
    document.getElementById('edit-phone').value = appointment.phone;
    document.getElementById('edit-motif').value = appointment.motif;
    document.getElementById('edit-nom_docteur').value = appointment.doctor;
    document.getElementById('edit-appointmentDate').value = appointment.date;
    document.getElementById('edit-selectedTime').value = new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('appointment_id').value = appointment.appointment_id;

    // Update doctors based on the selected motif
    updateDoctorsBasedOnMotif();

    // Ensure the doctor is selected in the dropdown after updating doctors
    document.getElementById('edit-nom_docteur').value = appointment.doctor;
    document.querySelector('input[name="appointment_id"]').value = appointment.appointment_id;
    document.getElementById('edit-form-container').style.display = 'block';  // Show the form
}

// Filter appointments based on the selected doctor
function filterAppointmentsByDoctor(doctor) {
    if (doctor === "tous") {
      return appointments; // If "Tous les Docteurs" is selected, show all appointments
    } else {
      return appointments.filter(appointment => appointment.doctor === doctor);
    }
}

// Add event listener to "Annuler" button to close the form
document.getElementById('cancel')?.addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('edit-form-container').style.display = 'none';
});

// Add filters for doctors
function populateFilters() {
    const filterSelect = document.getElementById('filters');
    filterSelect.innerHTML = ""; // Clear existing options

    // Add default option for all doctors
    const defaultOption = document.createElement('option');
    defaultOption.value = "tous";
    defaultOption.textContent = "Tous les Docteurs";
    filterSelect.appendChild(defaultOption);

    // Add options for each doctor
    Object.keys(doctorColors).forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor;
        option.textContent = doctor;
        filterSelect.appendChild(option);
    });

    // Add event listener for filter changes
    filterSelect.addEventListener('change', () => fetchAppointments());
}

// Populate the hours grid and fetch appointments
populateHours();
fetchAppointments();
populateFilters();
