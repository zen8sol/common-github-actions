# update-changelog-action

Automatic updates changelog(in format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)) with new version of project.

## Action
### Inputs

#### `newVersion`

**Required** New version of project

#### Outputs

#### Example usage

```yaml
uses: actions/zen8sol/update-changelog-action@<version>
with:
  newVersion: '1.0.3'
```

## Initial Changelog template

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]


## [0.1.0] - 2023-12-10

### Added

- inital release

**[unreleased]** https://github.com/<repository>/compare/0.1.0...HEAD  
**[0.1.0]** https://github.com/<repository>/releases/tag/0.1.0  

```