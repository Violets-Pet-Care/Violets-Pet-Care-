[preview-5.html](https://github.com/user-attachments/files/28485316/preview-5.html)# Violets-Pet-Care-
Pet sitting business 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Violet's Pet Care | Professional Pet Sitting & Loving Care</title>
    <style>
        /* Modern Color Palette & Global Variables */
        :root {
            --primary-color: #6a4c93; /* Soft violet/purple theme */
            --secondary-color: #8338ec; 
            --accent-color: #ff6b6b;
            --text-dark: #2b2d42;
            --text-light: #f8f9fa;
            --bg-light: #f4f6f9;
            --white: #ffffff;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            color: var(--text-dark);
            background-color: var(--bg-light);
            line-height: 1.6;
        }

        /* Navigation Bar */
        header {
            background-color: var(--white);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .navbar {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
        }

        .logo {
            font-size: 24px;
            font-weight: bold;
            color: var(--primary-color);
            text-decoration: none;
        }

        .nav-links {
            list-style: none;
            display: flex;
            gap: 20px;
        }

        .nav-links a {
            text-decoration: none;
            color: var(--text-dark);
            font-weight: 600;
            transition: color 0.3s ease;
        }

        .nav-links a:hover {
            color: var(--primary-color);
        }

        /* Hero Banner Section */
        .hero {
            background: linear-gradient(135deg, #6a4c93 0%, #8338ec 100%);
            color: var(--text-light);
            text-align: center;
            padding: 100px 20px;
        }

        .hero h1 {
            font-size: 42px;
            margin-bottom: 20px;
        }

        .hero p {
            font-size: 20px;
            max-width: 800px;
            margin: 0 auto 30px auto;
        }

        .btn {
            display: inline-block;
            background-color: var(--accent-color);
            color: var(--white);
            padding: 12px 30px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            font-size: 18px;
            transition: transform 0.2s, background-color 0.3s;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
            border: none;
            cursor: pointer;
        }

        .btn:hover {
            transform: translateY(-2px);
            background-color: #ff5252;
        }

        /* Container & Page Content Layout */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 60px 20px;
        }

        .section-title {
            text-align: center;
            font-size: 32px;
            color: var(--primary-color);
            margin-bottom: 40px;
            position: relative;
        }

        .section-title::after {
            content: '';
            display: block;
            width: 60px;
            height: 4px;
            background-color: var(--accent-color);
            margin: 10px auto 0 auto;
            border-radius: 2px;
        }

        /* Flex & Grid Systems */
        .about-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: center;
            margin-bottom: 60px;
        }

        @media (max-width: 768px) {
            .about-grid, .services-grid {
                grid-template-columns: 1fr !important;
            }
            .hero h1 { font-size: 32px; }
        }

        .experience-highlight {
            background-color: #eef2f7;
            padding: 30px;
            border-left: 5px solid var(--primary-color);
            border-radius: 4px;
        }

        /* Bullet lists styled with custom checkmark placeholders */
        .why-choose-list {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .why-choose-list li {
            background: var(--white);
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            font-weight: 500;
        }

        .why-choose-list li::before {
            content: "✓";
            color: #4caf50;
            font-weight: bold;
            margin-right: 12px;
            font-size: 18px;
        }

        /* Services Grid Style */
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
        }

        .service-card {
            background: var(--white);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            transition: transform 0.3s;
            display: flex;
            flex-direction: column;
        }

        .service-card:hover {
            transform: translateY(-5px);
        }

        .service-card h3 {
            color: var(--primary-color);
            margin-bottom: 10px;
            font-size: 22px;
        }

        .service-card p {
            color: #666;
            margin-bottom: 20px;
            font-style: italic;
        }

        .service-card ul {
            list-style: none;
            margin-top: auto;
        }

        .service-card ul li {
            padding: 6px 0;
            border-bottom: 1px solid #f0f0f0;
            font-size: 15px;
        }

        .service-card ul li:last-child {
            border-bottom: none;
        }

        .service-card ul li::before {
            content: "🐾";
            margin-right: 8px;
        }

        /* Contact Form Layout */
        .contact-section {
            background-color: var(--white);
            padding: 60px 20px;
            border-top: 1px solid #eef2f7;
        }

        .contact-form {
            max-width: 600px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .form-group label {
            font-weight: 600;
            color: var(--text-dark);
        }

        .form-group input, .form-group textarea, .form-group select {
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 16px;
            background-color: var(--bg-light);
        }

        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
            outline: 2px solid var(--primary-color);
            background-color: var(--white);
        }

        /* Footer Section */
        footer {
            background-color: var(--text-dark);
            color: var(--text-light);
            text-align: center;
            padding: 40px 20px;
        }

        footer p {
            font-size: 14px;
            opacity: 0.8;
        }
    </style>
</head>
<body>

    <!-- Header & Navigation -->
    <header>
        <nav class="navbar">
            <a href="#home" class="logo">Violets Pet Care</a>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#why-choose">Why Choose Us</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact & Booking</a></li>
            </ul>
        </nav>
    </header>

    <!-- Main Home Page Hero -->
    <section id="home" class="hero">
        <h1>Welcome to Violets Pet Care</h1>
        <p>Professional Pet Sitting & Loving Care While You're Away</p>
        <a href="#contact" class="btn">Book Care Today</a>
    </section>
    [Uploadi
    
    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Violet's Pet Care Membership Plans</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background: #f8fafc;
        margin: 0;
        padding: 40px;
        color: #333;
    }

    .container {
        max-width: 1200px;
        margin: auto;
        text-align: center;
    }

    h1 {
        color: #2c5282;
        margin-bottom: 10px;
    }

    .subtitle {
        margin-bottom: 40px;
        color: #666;
    }

    .pricing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 25px;
    }

    .plan {
        background: white;
        border-radius: 15px;
        padding: 30px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        transition: 0.3s;
    }

    .plan:hover {
        transform: translateY(-5px);
    }

    .featured {
        border: 3px solid #38a169;
    }

    .plan h2 {
        color: #2d3748;
    }

    .price {
        font-size: 2rem;
        color: #38a169;
        margin: 15px 0;
        font-weight: bold;
    }

    ul {
        list-style: none;
        padding: 0;
        text-align: left;
    }

    ul li {
        padding: 8px 0;
        border-bottom: 1px solid #eee;
    }

    .btn {
        display: inline-block;
        margin-top: 20px;
        background: #38a169;
        color: white;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 8px;
        font-weight: bold;
    }

    .services {
        margin-top: 60px;
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        text-align: left;
    }

    .services h2 {
        color: #2c5282;
    }
</style>
</head>
<body>

<div class="container">

    <h1>Violet's Pet Care offers Monthly Pet Care Memberships</h1>
    <p class="subtitle">
        Save money with prepaid monthly credits for dog walks and drop-in visits. Just remember [availabilty is limited] Take advantage of the month and use your credits!
    </p>

    <div class="pricing-grid">

        <div class="plan">
            <h2>Starter</h2>
            <div class="price">$180/mo</div>
            <ul>
                <li>20 Visit Credits(Save $20)</li>
                <li>Use for any 30-minute drop-in</li>
                <li>Priority Scheduling</li>
                <li>Unused credits roll over 30 days</li>
            </ul>
            <a href="#" class="btn">Join Now</a>
        </div>

        <div class="plan featured">
            <h2>Frequent Care</h2>
            <div class="price">$360/mo</div>
            <ul>
                <li>40 Visit Credits(Save $40)</li>
                <li>Best Value</li>
                <li>Priority Scheduling</li>
                <li>Unused credits roll over 30 days</li>
            </ul>
            <a href="#" class="btn">Join Now</a>
        </div>

        <div class="plan">
            <h2>VIP Pet Parent</h2>
            <div class="price">$540/mo</div>
            <ul>
                <li>60 Visit Credits (Save $60)</li>
                <li>Maximum Savings</li>
                <li>VIP Scheduling</li>
                <li>Unused credits roll over 30 days</li>
            </ul>
            <a href="#" class="btn">Join Now</a>
        </div>

    </div>

    <div class="services">
        <h2>Services & Pricing</h2>

        <h3>30-Minute Drop-In Visit - $40</h3>
        <p>
            Includes potty break, dog walk, feeding, fresh water,
            litter box cleaning, playtime, and updates.
        </p>

        <h3>60-Minute Drop-In Visit - $70</h3>
        <p>
            Extended walk, feeding, fresh water, litter box cleaning,
            playtime, enrichment activities, and detailed updates.
        </p>

        <h3>Add-On Services</h3>
        <ul>
            <li>Medication Administration: +$5 per visit</li>
            <li>Additional Dog: +$10 per visit</li>
            <li>Additional Cat: +$5 per visit</li>
        </ul>

        <h3>Credit Values</h3>
        <ul>
            <li>30-Minute Visit = 4 Credits</li>
            <li>60-Minute Visit = 8 Credits</li>
            <li>Medication Administration = 0.5 Credit</li>
            <li>Additional Dog = 1 Credit</li>
            <li>Additional Cat = 0.5 Credit</li>
        </ul>

        <p><strong>Note:</strong> Memberships renew monthly and provide priority scheduling for members.</p>
    </div>

</div>

</body>
</html>ng preview-5.html…]()


    <!-- Home Page About Content -->
    <div class="container">
        <div class="about-grid">
            <div>
                <h2 style="font-size: 28px; margin-bottom: 15px; color: var(--primary-color);">Your pets deserve more than just a quick drop-in feed.</h2>
                <p style="margin-bottom: 15px; font-size: 17px;">They deserve care from an experienced animal professional who understands their needs, routines, and unique personalities.</p>
                <p>Whether you're taking a vacation, working long hours, or simply need an extra helping hand, Violets Pet Care provides dependable, compassionate care you can trust completely.</p>
            </div>
            <div class="experience-highlight">
                <h3 style="margin-bottom: 10px; color: var(--secondary-color);">Professional Expertise</h3>
                <p>With over <strong>16 years of experience</strong> in the animal industry and currently working as a professional groomer, I care for animals every single day.</p>
                <br>
                <p>My hands-on experience allows me to recognize stress signals, subtle behavioral changes, and individual needs that make all the difference while you're away.</p>
            </div>
        </div>
    </div>

    <!-- Why Choose Us Section -->
    <section id="why-choose" style="background-color: #ebf0f6; padding: 60px 0;">
        <div class="container" style="padding-top: 0; padding-bottom: 0;">
            <h2 class="section-title">Why Choose Violets Pet Care?</h2>
            <ul class="why-choose-list">
