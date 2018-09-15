const fs = require('fs')
const path = require('path')

const src_directory = path.join(__dirname, '../src')

function cancel_commit(message = '') {
  console.error(message)
  process.exit(1)
}

function recursive_lookup(dir, action = () => {}) {
  const children = fs.readdirSync(dir)

  for (const child of children) {
    const child_path = path.join(dir, child)

    if (fs.statSync(child_path).isDirectory()) {
      recursive_lookup(child_path)
    }

    else {
      action(child_path)
    }
  }
}

function scan_file(file_path) {
  const file_content = fs.readFileSync(file_path, 'utf8')
    .toLowerCase()

  const forbidden_words = [
    'todo'
  ]

  const found_words = forbidden_words
    .filter(word => file_content.includes(word))

  if (found_words.length) {
    return {
      file_path,
      forbidden_words: found_words
    }
  }

  return null
}

function main() {
  let files_with_error = []

  recursive_lookup(src_directory, (file_path) => {
    const result = scan_file(file_path)

    if (result !== null) {
      files_with_error.push(result)
    }
  })

  if (files_with_error.length) {
    const cancel_message = files_with_error
      .map(error => `forbidden words [${error.forbidden_words.join(', ')}] found in file "${error.file_path}"`)

    cancel_commit(cancel_message)
  }
}

main()