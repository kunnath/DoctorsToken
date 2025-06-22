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

module.exports = {
  sendAppointmentRequestEmail,
  sendAppointmentApprovalEmail,
  sendAppointmentRejectionEmail,
  sendGpsCancellationEmail,
  sendGpsCancellationEmailToDoctor,
};
