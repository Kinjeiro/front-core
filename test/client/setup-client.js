import enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';

// todo @ANKU @LOW - можно доделать, но i18n лезет за файлами 404: /assets/i18n/en/core.js
// инициализация клинтских переменных (в частности локализации)
// import '../../src/client/init';

enzyme.configure({ adapter: new EnzymeAdapter() });

window.enzyme = enzyme;
