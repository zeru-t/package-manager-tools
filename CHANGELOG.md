# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## v1.0.3 (3/20/2025)

### Changed

- Updated commands to run as tasks (if command should run immediately)
- Updated commands to run in a new terminal (if command should not run immediately)


## v1.0.2 (2/14/2025)

### Changed

- Fixed issue with terminal actions not working when terminal is not active
- Terminal button will now close the terminal if it is already open
- Added needed files back in to the built package


## v1.0.1 (2/8/2025)

### Changed

- Updated README
- Removed unneeded files from the built package


## v1.0.0 (2/8/2025)

### *Initial release*

### Added

- Toggle Terminal button
- Package Manager Buttons
  - Switch package manager
  - Install all packages
  - Install specific package
  - Remove specific package
  - List all packages
  - Get package manager version
- Update App Version button
- Package Annotations
  - Logic to search package.json file for scripts
  - Logic to match scripts to with matching annotation
  - Display of annotations via CodeLens
  - *Generate Annotations* status bar button
- New Settings
  - Specify package manager
  - Customize status bar button labels
  - Hide specific status bar buttons