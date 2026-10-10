<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Violet's Pet Care Calculator</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="app-shell">
      <header class="header">
        <p class="eyebrow">Violet's Pet Care</p>
        <h1>Visit Cost Calculator</h1>
      </header>

      <main class="calculator-card">
        <label for="service">Service</label>
        <select id="service">
          <option value="45">30-Minute Drop-In — $45</option>
          <option value="80">60-Minute Drop-In — $80</option>
          <option value="10">Add-on-each additional dog — $10</option>
          <option value="5">Add-on-each additional cat — $5</option>
          <option value="2">Add-on-each additional photo(NOTE:only add if you’re needing Photo for more than 1 otherwise you get 1 free photo per visit) — $2</option>
        </select>

        <label for="visits">Number of visits</label>
        <input id="visits" type="number" min="1" max="20" value="1" />

        <div class="checkboxes">
          <label>
            <input id="photoUpdate" type="checkbox" />
            Photo update + $2 each pet
          </label>
          <label>
            <input id="holidayVisit" type="checkbox" />
            Holiday visit + $15 each additional
          </label>
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Visit total</span>
            <strong id="visitTotal">$45.00</strong>
          </div>
          <div class="total-row">
            <span>Add-ons</span>
            <strong id="addonTotal">$0.00</strong>
          </div>
          <div class="total-row grand-total">
            <span>Estimated total</span>
            <strong id="grandTotal">$45.00</strong>
          </div>
        </div>

        <button id="calculateBtn">Calculate total</button>
      </main>
    </div>

    <script src="script.js"></script>
  </body>
</html>
