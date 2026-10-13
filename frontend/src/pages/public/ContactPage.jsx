import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  CheckCircleIcon,
} from '../../components/icons';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  }

  function validate() {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please provide an inquiry message.';
    }

    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Your WhatsApp number in Nigerian international format.
    const whatsappNumber = '2347066564484';

    // Build the inquiry using the visitor's form details.
    const whatsappMessage = `
New Inquiry - Crestfield Academy

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Inquiry Type: ${formData.inquiryType}

Message:
${formData.message}
    `.trim();

    // Encode the message so it works correctly in a URL.
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    // Open WhatsApp with the inquiry ready to send.
    window.open(whatsappURL, '_blank', 'noopener,noreferrer');

    // Show the next-step message on the contact page.
    setSubmitted(true);
  }

  function resetForm() {
    setSubmitted(false);

    setFormData({
      name: '',
      email: '',
      phone: '',
      inquiryType: 'general',
      message: '',
    });

    setErrors({});
  }

  return (
    <div>
      {/* Banner */}
      <section
        className="section"
        style={{
          backgroundColor: 'var(--color-navy-950)',
          color: '#ffffff',
          padding: 'var(--space-12) 0',
        }}
      >
        <div className="container">
          <div className="flex-col gap-3" style={{ maxWidth: '720px' }}>
            <Badge variant="gold">Official Inquiries</Badge>

            <h1
              className="heading-xl"
              style={{ color: '#ffffff' }}
            >
              Contact School Administration
            </h1>

            <p
              className="text-lead"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              Reach out to our admissions office, academic counselors,
              or administrative desk.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2 gap-8">
            {/* Left: Contact Details */}
            <div className="flex-col gap-6">
              <div>
                <span
                  className="badge badge-navy"
                  style={{ marginBottom: 'var(--space-2)' }}
                >
                  Office Location
                </span>

                <h2 className="heading-lg">
                  School Address & Operating Hours
                </h2>

                <p className="text-muted">
                  Official inquiries, document requests, and student
                  admissions correspondence.
                </p>
              </div>

              <div className="flex-col gap-4">
                {/* Campus Address */}
                <Card className="flex items-start gap-3">
                  <div
                    style={{
                      color: 'var(--color-navy-800)',
                      marginTop: '2px',
                    }}
                  >
                    <MapPinIcon size={24} />
                  </div>

                  <div>
                    <h4
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--color-navy-900)',
                      }}
                    >
                      Campus Address
                    </h4>

                    <p
                      className="text-muted"
                      style={{ fontSize: '0.875rem' }}
                    >
                     plot 175, Cadastral Zone E27
                      <br />
                      APO / Abuja / FCT, Nigeria
                    </p>
                  </div>
                </Card>

                {/* Phone Lines */}
                <Card className="flex items-start gap-3">
                  <div
                    style={{
                      color: 'var(--color-navy-800)',
                      marginTop: '2px',
                    }}
                  >
                    <PhoneIcon size={24} />
                  </div>

                  <div>
                    <h4
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--color-navy-900)',
                      }}
                    >
                      Phone Lines
                    </h4>

                    <p
                      className="text-muted"
                      style={{ fontSize: '0.875rem' }}
                    >
                      Main Office: 07066564484
                      <br />
                      Admissions Desk: 07066564484
                    </p>
                  </div>
                </Card>

                {/* Email */}
                <Card className="flex items-start gap-3">
                  <div
                    style={{
                      color: 'var(--color-navy-800)',
                      marginTop: '2px',
                    }}
                  >
                    <MailIcon size={24} />
                  </div>

                  <div>
                    <h4
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--color-navy-900)',
                      }}
                    >
                      Electronic Mail
                    </h4>

                    <p
                      className="text-muted"
                      style={{ fontSize: '0.875rem' }}
                    >
                      General Inquiries: crest@gmail.com
                      <br />
                      Admissions & Portal: @yahoocacdemy.com
                    </p>
                  </div>
                </Card>

                {/* Working Hours */}
                <Card
                  featured
                  style={{ backgroundColor: 'var(--color-bg-white)' }}
                >
                  <h4
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--color-navy-900)',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    Administrative Working Hours
                  </h4>

                  <p
                    className="text-muted"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Monday – Friday: 7:30 AM – 3:30 PM
                    <br />
                    Weekends & Public Holidays: Closed
                  </p>
                </Card>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div>
              <Card featured className="p-8">
                <h3
                  className="heading-md"
                  style={{ marginBottom: 'var(--space-2)' }}
                >
                  Send an Inquiry
                </h3>

                <p
                  className="text-muted"
                  style={{
                    fontSize: '0.875rem',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  Complete the form below to contact the school
                  administration through WhatsApp.
                </p>

                {submitted ? (
                  <div
                    className="flex-col items-center gap-3"
                    style={{
                      padding: 'var(--space-8) 0',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ color: 'var(--color-success)' }}>
                      <CheckCircleIcon size={48} />
                    </div>

                    <h4
                      className="heading-md"
                      style={{ color: 'var(--color-navy-900)' }}
                    >
                      Continue on WhatsApp
                    </h4>

                    <p
                      className="text-muted"
                      style={{
                        fontSize: '0.875rem',
                        maxWidth: '380px',
                      }}
                    >
                      Thank you, <strong>{formData.name}</strong>.
                      WhatsApp should open with your inquiry details
                      ready to send. Please press Send in WhatsApp to
                      deliver your message to Crestfield Academy.
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetForm}
                    >
                      Send Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Full Name */}
                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="contact-name"
                      >
                        Full Name *
                      </label>

                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. Mr. Chinedu Eze"
                      />

                      {errors.name && (
                        <p
                          style={{
                            color: 'var(--color-danger)',
                            fontSize: '0.75rem',
                            marginTop: '4px',
                          }}
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="contact-email"
                      >
                        Email Address *
                      </label>

                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. chinedu@example.com"
                      />

                      {errors.email && (
                        <p
                          style={{
                            color: 'var(--color-danger)',
                            fontSize: '0.75rem',
                            marginTop: '4px',
                          }}
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="contact-phone"
                      >
                        Phone Number (Optional)
                      </label>

                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. +234 803 000 0000"
                      />
                    </div>

                    {/* Inquiry Category */}
                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="contact-inquiry"
                      >
                        Inquiry Category
                      </label>

                      <select
                        id="contact-inquiry"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="general">
                          General Inquiry
                        </option>

                        <option value="admissions">
                          Admission into JSS 1 – SSS 3
                        </option>

                        <option value="academic">
                          Academic Transcripts & Results
                        </option>

                        <option value="portal">
                          Portal Technical Support
                        </option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="contact-message"
                      >
                        Message *
                      </label>

                      <textarea
                        id="contact-message"
                        name="message"
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Please write your inquiry here..."
                      />

                      {errors.message && (
                        <p
                          style={{
                            color: 'var(--color-danger)',
                            fontSize: '0.75rem',
                            marginTop: '4px',
                          }}
                        >
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      variant="gold"
                      size="lg"
                      type="submit"
                      className="w-full"
                    >
                      Submit Inquiry
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}