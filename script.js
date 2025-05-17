document.addEventListener("DOMContentLoaded", () => {
  // Handle URL hash for FAQ section
  const scrollToSection = () => {
    if (window.location.hash === '#faq') {
      const faqSection = document.getElementById('faq')
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // Check hash on page load and when hash changes
  scrollToSection()
  window.addEventListener('hashchange', scrollToSection)

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
      // Netlify handles the form submission
      // We just need to handle the success message
      const button = contactForm.querySelector("button[type='submit']")
      const originalText = button.textContent
      
      const showSuccess = () => {
        button.textContent = "Message Sent!"
        button.style.backgroundColor = "#4CAF50"
        contactForm.reset()
        
        setTimeout(() => {
          button.textContent = originalText
          button.style.backgroundColor = ""
        }, 3000)
      }

      // If the form is submitted successfully, Netlify will handle the redirect
      // But we'll show a success message anyway
      setTimeout(showSuccess, 1000)
    })
  }
})

