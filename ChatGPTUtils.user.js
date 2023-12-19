// ==UserScript==
// @name        ChatGPT Utilities
// @namespace   ligature.me
// @match       *://*/*
// @grant       none
// @version     1.1
// @author      -
// @description 12/15/2023, 11:52:35 AM
// @grant       GM_registerMenuCommand
// @grant       GM_openInTab
// @require https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// ==/UserScript==

async function summarizeUrl(url) {
  log(`Summarizing ${url}`)
  await setInput(`Summarize the following URL: ${url}`)
  await send()
}

async function defineWord(word) {
  log(`Defining ${word}`)
  await setInput(`Define this word: ${word}`)
  await send()
}

async function main() {
  if (window.location.host === 'chat.openai.com') {
    await setGpt4()

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('summarize')) await summarizeUrl(urlParams.get('summarize'))
    if (urlParams.get('define')) await defineWord(urlParams.get('define'))

  } else {
    // All other sites
    GM_registerMenuCommand('Summarize with GPT', () => {
      // Get the current URL
      const thisUrl = encodeURIComponent(window.location.href)
      // Open ChatGPT
      const gptUrl = `https://chat.openai.com/?model=gpt-4&summarize=${thisUrl}`
      GM_openInTab(gptUrl)
    })

  }
}

async function setGpt4() {
  // Wait for it to be GPT 4
  log('Waiting for GPT 4')
  await waitFor('span.text-token-text-secondary', /4/)
}

async function setInput(content) {
  log('Waiting for input box')
  const inputBox = await waitFor('#prompt-textarea')
  inputBox.value = content
  inputBox.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
}

async function send() {
  log('Waiting for send button')
  const sendButton = await waitFor('[data-testid="send-button"]:not([disabled]')
  sendButton.click()
}

function waitFor(selector, content) {
  return new Promise((res) => {
    VM.observe(document.body, () => {
      // Find the target node
      const node = document.querySelector(selector)
      if (node) {
        if (content) {
          // The node must have specific content
          if (node.textContent.match(content)) {
            res(node)
            // disconnect observer
            return true
          }
        } else {
          // We just need to find the node
          res(node)
          // disconnect observer
          return true
        }
      }
    });
  })
}

function log(message) {
  console.info(`%c[GPT Utils] `, 'color: blue', message)
}

main()
