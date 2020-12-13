import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import fontUrl from './fonts/WorkSans-VariableFont_wght.ttf'
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import store from './store';
import { BrowserRouter as Router } from 'react-router-dom'


const theme = {
  primaryColor: '#232931',
  secondaryColor: '#393e46'
}

const GlobalStyle = createGlobalStyle`

  @font-face {
    font-family: 'Work Sans';
    src: url(${fontUrl});
    font-weight: 300;
  }

  @font-face {
    font-family: 'Work Sans';
    src: url(${fontUrl});
    font-weight: 400;
  }

  @font-face {
    font-family: 'Work Sans';
    src: url(${fontUrl});
    font-weight: 500;
  }

  @font-face {
    font-family: 'Work Sans';
    src: url(${fontUrl});
    font-weight: 600;
  }

  body {
    font-family: 'Work Sans';
    font-weight: 300;
    margin: 0;
    color: white;
    background-color: ${theme.primaryColor};
  * {
    box-sizing: border-box;
  }
`

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <App />
          <GlobalStyle />
        </ThemeProvider>
      </Provider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
