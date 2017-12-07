import { browser, by, element } from 'protractor';
import { } from '@types/jasmine';

describe('App', () => {

  beforeEach(() => {
    // change hash depending on router LocationStrategy
    browser.get('/#/home');
  });


  it('should have a title', () => {
    let subject = browser.getTitle();
    let result = 'ShootQ';
    expect(subject).toEqual(result);
  });

});
