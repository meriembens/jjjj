// Initialisation de Flatpickr pour le calendrier
flatpickr("#appointmentDate", {
  enableTime: false, // Only date selection allowed
  locale: "fr", // Use French locale
  dateFormat: "Y-m-d", // Full date format (Day Month Year)
  minDate: "today", // Disable past dates
  disable: [
      function(date) {
          return date.getDay() === 5 || date.getDay() === 6; // Disable Fridays (5) and Saturdays (6)
      }
  ],
  firstDayOfWeek: 6, // Start the week on Sunday
  onChange: function(selectedDates) {
      // Show/hide the message if a date is selected
      const noDateMessage = document.getElementById("no-date-message");
      noDateMessage.style.display = selectedDates.length === 0 ? "block" : "none";
  },
  onReady: () => {
      // Show message initially if no date is pre-selected
      const noDateMessage = document.getElementById("no-date-message");
      noDateMessage.style.display = "block";
  }
});
function handleFormSubmit(event) {
  // Prevent the default form submission
  event.preventDefault();
  submitForm();
}

// Mapping doctor specialties
const doctorSpecialties = {
  "Consultation générale": ["Dr Keciour Nesma", "Dr Belhedid Ibtissem", "Dr Bensalah Meriem", "Dr Guerroumi Lynda", "Dr Bouchetara Ryane"],
  "Blanchiment dentaire": ["Dr Keciour Nesma", "Dr Belhedid Ibtissem", "Dr Bensalah Meriem"],
  "Détartrage et nettoyage": ["Dr Keciour Nesma", "Dr Belhedid Ibtissem", "Dr Guerroumi Lynda"],
  "Orthodontie": ["Dr Keciour Nesma", "Dr Bensalah Meriem", "Dr Bouchetara Ryane"],
  "Soin des caries": ["Dr Belhedid Ibtissem", "Dr Bensalah Meriem", "Dr Guerroumi Lynda"],
  "Implant dentaire": ["Dr Bensalah Meriem", "Dr Guerroumi Lynda", "Dr Bouchetara Ryane"],
  "Traitement de canal": ["Dr Bensalah Meriem", "Dr Guerroumi Lynda"],
  "Prothése dentaire": ["Dr Bensalah Meriem", "Dr Guerroumi Lynda", "Dr Bouchetara Ryane"]
};

// Function to update doctor options based on the selected motif
function updateDoctorsBasedOnMotif() {
  const motif = document.getElementById('motif').value; // Get the selected motif
  const doctorSelect = document.getElementById('nom_docteur'); // Get the doctor select dropdown

  // Clear the current doctor options
  doctorSelect.innerHTML = '<option value="" disabled selected>Choisir un médecin</option>';

  // Check if there are doctors available for the selected motif
  if (motif && doctorSpecialties[motif]) {
      doctorSpecialties[motif].forEach(nom_docteur => {
          const option = document.createElement('option');
          option.value = nom_docteur; // Set the value to the doctor's name
          option.textContent = nom_docteur; // Display the doctor's name
          doctorSelect.appendChild(option); // Add the option to the select
      });
  }
}

// Attach the change event listener to the motif dropdown
document.getElementById('motif').addEventListener('change', updateDoctorsBasedOnMotif);

// Call the function once to populate the doctors on page load (in case a motif is pre-selected)
updateDoctorsBasedOnMotif();

// Function to generate time slots
// Function to generate time slots dynamically based on selected doctor and date
// Function to generate time slots dynamically based on selected doctor and date
async function generateTimeSlots() {
  const timeSlots = document.querySelector(".slots");
  timeSlots.innerHTML = ""; // Clear previous slots

  // Get selected doctor and date
  const doctor = document.getElementById("nom_docteur").value;
  const date = document.getElementById("appointmentDate").value;

  // Ensure both doctor and date are selected
  if (!doctor || !date) {
      alert("Veuillez sélectionner un médecin et une date.");
      return;
  }

  // Fetch booked slots from the backend
  let bookedSlots = [];
  try {
      const response = await fetch('process.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `doctor=${encodeURIComponent(doctor)}&date=${encodeURIComponent(date)}`
      });
      bookedSlots = await response.json(); // Expecting an array of booked times (e.g., ["08:00", "09:00"])
  } catch (error) {
      console.error("Error fetching booked slots:", error);
      alert("Une erreur est survenue lors de la récupération des créneaux horaires.");
      return;
  }

  // Available time slots
  const times = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00"];

  // Create buttons for each time slot
  times.forEach((time) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = time;

      // Disable the button if the slot is already booked
      if (bookedSlots.includes(time)) {
          button.disabled = true;
          button.classList.add("disabled");
      } else {
          // Add click event to highlight selected slot
          button.addEventListener("click", () => {
              document.querySelectorAll(".slots button").forEach(btn => btn.classList.remove("selected"));
              button.classList.add("selected");

              // Update the hidden input value for time
              document.getElementById("selectedTime").value = time;
          });
      }

      timeSlots.appendChild(button);
  });
}

// Event listener for doctor selection change
document.getElementById('nom_docteur').addEventListener('change', generateTimeSlots);

// Event listener for date selection change
document.getElementById('appointmentDate').addEventListener('change', generateTimeSlots);
