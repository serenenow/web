document.addEventListener("DOMContentLoaded", () => {
  // Accordion functionality
  const accordionItems = document.querySelectorAll(".accordion-item")

  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header")
    const content = item.querySelector(".accordion-content")

    header.addEventListener("click", () => {
      // Toggle active class on the item
      const isActive = item.classList.contains("active")

      // Close all accordion items
      accordionItems.forEach((accItem) => {
        accItem.classList.remove("active")
        accItem.querySelector(".accordion-content").classList.remove("active")
      })

      // If the clicked item wasn't active, open it
      if (!isActive) {
        item.classList.add("active")
        content.classList.add("active")
      }
    })
  })

  // Form submission
  const contactForm = document.getElementById("contact-form")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form values
      const name = document.getElementById("name").value
      const email = document.getElementById("email").value
      const message = document.getElementById("message").value

      // Here you would typically send the form data to a server
      // For GitHub Pages, you might use a service like Formspree

      // For now, just show an alert
      alert(`Thank you, ${name}! Your message has been received. We'll get back to you soon.`)

      // Reset the form
      contactForm.reset()
    })
  }
})

