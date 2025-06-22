const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured. Email would be sent:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML: ${html}`);
      return;
    }

    const msg = {
      to,
      from: process.env.FROM_EMAIL || 'noreply@doctorstoken.com',
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

const sendAppointmentRequestEmail = async (doctorEmail, doctorName, patientName, date, time, reason) => {
  const subject = 'New Appointment Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">New Appointment Request</h2>
      <p>Dear Dr. ${doctorName},</p>
      <p>You have received a new appointment request:</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>Please log in to your dashboard to approve or reject this appointment.</p>
      <p>Best regards,<br>Doctors Token System</p>
    </div>
  `;
  
  await sendEmail(doctorEmail, subject, html);
};

const sendAppointmentApprovalEmail = async (patientEmail, patientName, doctorName, hospitalName, date, time, token) => {
  const subject = 'Appointment Approved';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">Appointment Approved</h2>
      <p>Dear ${patientName},</p>
      <p>Great news! Your appointment has been approved.</p>
      <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27ae60;">
        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p><strong>Hospital:</strong> ${hospitalName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Appointment Token:</strong> <span style="font-size: 18px; font-weight: bold; color: #27ae60;">${token}</span></p>
      </div>
      <p><strong>Important:</strong> Please arrive at the hospital on time and ensure you are within 500 meters of the hospital for GPS verification.</p>
      <p>Best regards,<br>Doctors Token System</p>
    </div>
  `;
  
  await sendEmail(patientEmail, subject, html);
};

const sendAppointmentRejectionEmail = async (patientEmail, patientName, doctorName, date, time, reason) => {
  const subject = 'Appointment Rejected';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Appointment Rejected</h2>
      <p>Dear ${patientName},</p>
      <p>We regret to inform you that your appointment has been rejected.</p>
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>
      <p>You can book another appointment at a different time or with another doctor.</p>
      <p>Best regards,<br>Doctors Token System</p>
    </div>
  `;
  
  await sendEmail(patientEmail, subject, html);
};

const sendGpsCancellationEmail = async (patientEmail, patientName, doctorName, hospitalName, date, time, distance, maxDistance) => {
  const subject = 'Appointment Cancelled - GPS Verification Failed';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Appointment Cancelled</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment has been automatically cancelled due to GPS verification failure.</p>
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p><strong>Hospital:</strong> ${hospitalName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Your Distance:</strong> ${distance} meters</p>
        <p><strong>Required Distance:</strong> Within ${maxDistance} meters</p>
      </div>
      <p>You were ${distance - maxDistance} meters too far from the hospital. Please ensure you are within the required distance for future appointments.</p>
      <p>Best regards,<br>Doctors Token System</p>
    </div>
  `;
  
  await sendEmail(patientEmail, subject, html);
};

const sendGpsCancellationEmailToDoctor = async (doctorEmail, doctorName, patientName, date, time, distance, maxDistance) => {
  const subject = 'Appointment Cancelled - Patient GPS Verification Failed';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Appointment Cancelled</h2>
      <p>Dear Dr. ${doctorName},</p>
      <p>An appointment has been automatically cancelled due to patient GPS verification failure.</p>
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Patient Distance:</strong> ${distance} meters</p>
        <p><strong>Required Distance:</strong> Within ${maxDistance} meters</p>
      </div>
      <p>The patient was ${distance - maxDistance} meters too far from the hospital location.</p>
      <p>Best regards,<br>Doctors Token System</p>
    </div>
  `;
  
  await sendEmail(doctorEmail, subject, html);
};

const sendAppointmentReminderEmail = async (patientEmail, patientName, doctorName, hospitalName, date, time, token, minutesBefore, cancelUrl) => {
  const subject = `Appointment Reminder - ${minutesBefore} minutes`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3498db;">Appointment Reminder</h2>
      <p>Dear ${patientName},</p>
      <p>This is a reminder that you have an appointment in <strong>${minutesBefore} minutes</strong>.</p>
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3498db;">
        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p><strong>Hospital:</strong> ${hospitalName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Appointment Token:</strong> <span style="font-size: 18px; font-weight: bold; color: #3498db;">${token}</span></p>
      </div>
      
      ${minutesBefore >= 15 ? `
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="color: #856404; margin-top: 0;">Need to Cancel?</h3>
        <p style="margin-bottom: 10px;">If you need to cancel this appointment, please click the button below:</p>
        <a href="${cancelUrl}" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Cancel Appointment</a>
        <p style="font-size: 12px; color: #6c757d; margin-top: 10px;">Please cancel as soon as possible to allow other patients to book this slot.</p>
      </div>
      ` : `
      <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <h3 style="color: #721c24; margin-top: 0;">Final Reminder</h3>
        <p><strong>Your appointment is in 15 minutes!</strong> Please ensure you are at the hospital and ready for GPS verification.</p>
        <p>If you cannot make it, please call the hospital directly to inform them.</p>
      </div>
      `}
      
      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3 style="color: #155724; margin-top: 0;">Important Reminders:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Arrive at the hospital on time</li>
          <li>Ensure you are within 500 meters of the hospital for GPS verification</li>
          <li>Bring a valid ID and any required documents</li>
          <li>If you feel unwell, please call ahead to inform the hospital</li>
        </ul>
      </div>
      
      <p>Best regards,<br>Doctors Token System</p>
    </div>
  `;
  
  await sendEmail(patientEmail, subject, html);
};

const sendCancellationNotificationToDoctor = async (doctorEmail, doctorName, patientName, date, time, token, reason, cancelledBy) => {
  const subject = 'Appointment Cancelled by Patient';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Appointment Cancelled</h2>
      <p>Dear Dr. ${doctorName},</p>
      <p>An appointment has been cancelled by the patient.</p>
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Appointment Token:</strong> ${token}</p>
        <p><strong>Cancelled by:</strong> ${cancelledBy}</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>
      <p>This appointment slot is now available for other patients to book.</p>
      <p>Best regards,<br>Doctors Token System</p>
    </div>
  `;
  
  await sendEmail(doctorEmail, subject, html);
};

const sendCancellationConfirmationToPatient = async (patientEmail, patientName, doctorName, hospitalName, date, time, token) => {
  const subject = 'Appointment Cancellation Confirmed';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Appointment Cancelled Successfully</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment has been successfully cancelled.</p>
      <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p><strong>Hospital:</strong> ${hospitalName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Cancelled Token:</strong> <span style="text-decoration: line-through;">${token}</span></p>
      </div>
      <p>You can book a new appointment anytime through our platform.</p>
      <p>Best regards,<br>Doctors Token System</p>
    </div>
  `;
  
  await sendEmail(patientEmail, subject, html);
};

module.exports = {
  sendAppointmentRequestEmail,
  sendAppointmentApprovalEmail,
  sendAppointmentRejectionEmail,
  sendGpsCancellationEmail,
  sendGpsCancellationEmailToDoctor,
  sendAppointmentReminderEmail,
  sendCancellationNotificationToDoctor,
  sendCancellationConfirmationToPatient,
};
