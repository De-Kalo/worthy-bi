const { readdirSync } = require('fs')
const { execSync } = require('child_process')

const getDirectories = (source) => readdirSync(source, { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory())
	.map((dirent) => dirent.name)

const getDirectoriesRecursive = (source, base = '') => {
	const dirs = getDirectories(source).map((d) => `${source}/${d}`)
	dirs.forEach((dir) => {
		dirs.push(...getDirectoriesRecursive(dir))
	})
	return dirs
}

const dirs = getDirectoriesRecursive('src')
dirs.push('src')
dirs.forEach((dir) => {
	console.log(`Building ${dir}`)
	execSync(`babel -d ${dir.replace(/src/g,'build')} ${dir}/*.js -s --retain-lines --ignore **/*.spec.js`)
})
