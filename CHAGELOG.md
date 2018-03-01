# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2018-03-01
### !!! Breaking changes:
1) переделал роутинг на опции среди которых можно переопределить классы для некоторых компонентов
2) переделал authStrategy: теперь вместо token она работает от (request, response)

### Added
- feat(auth): - !!! переделал роутинг на опции среди которых можно переопределить классы для некоторых компонентов // !!! - переделал authStrategy теперь она работает от request, response // если сесси протухла, то либо появится сообщение о переходе на логин страницу, либо форма логина (в завизимости от config.common.features.auth.reLoginModalForm) за этим следить AuthErrorContainer // добавлен новый redux lastUniError (в промисах) // uni-error теперь содержит поле isNoAuth, если слетела авторизаци // в i18n-utils появился метод для биндинга namespace translateWithNamespace // пофиксил багу queryString что не энкодился hash


## [1.1.0] - 2018-02-27

### !!! Breaking changes:
1) **BaseApiClient** метод **serializeRequest** теперь принимает два параметра и должен вернуть request.
<br/>При наследовании старые **serializeRequest** переименуйте в **parseOptions**

### Added
- feat(api): - обновлен BaseApiClient - добавлены в request options: serializer, deserializer, optionsParser \\ добавлены методы у apiClient: downloadFile и uploadFile \\ добавил библиотеку file-saver@1.3.3

<!--
### Added
- feat(api): - обновлен BaseApiClient - добавлены в request options: serializer, deserializer, optionsParser \\ добавлены методы у apiClient: downloadFile и uploadFile \\ добавил библиотеку file-saver@1.3.3

### Changed
- Start using "changelog" over "change log" since it's the common usage.

### Removed
- Section about "changelog" vs "CHANGELOG".
-->

<!--
[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.8...v0.1.0
[0.0.8]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.0.1...v0.0.2
-->
