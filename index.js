#!/usr/bin/env node

import puppeteer from 'puppeteer';

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';

import childProcess from 'child_process';

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function askCaptcha(){
  const answer = await inquirer.prompt({
    name: 'captchaSolution',
    type: 'input',
    message: 'Introduce el captcha de la imagen:'
  })
  return answer.captchaSolution;
}

async function askVideo(){
  const answer = await inquirer.prompt({
    name: 'video',
    type: 'input',
    message: 'Introduce la url del video:'
  })
  return answer.video;
}

async function askMax(){
  const answer = await inquirer.prompt({
    name: 'max',
    type: 'input',
    message: 'Introduce el número de visitas que desea:'
  })
  return answer.max;
}

async function checkCaptcha(captcha) {
  const spinner = createSpinner('Comprobando Captcha...').start();
  try{
    await page.focus('input[name=captcha_secure]');
    await page.keyboard.type(captcha);
    await page.click('form > div > div > div > div > button');

    await page.waitForSelector('button[class="btn btn-primary rounded-0 menu4"]', {timeout: 3000});
    // await page.screenshot({path: 'ejecucion.png'});
    spinner.success({text: `Captcha correcto.`});
  } catch(e){
    spinner.error({text:`Captcha incorrecto.`});
    process.exit(1);
  }
}

async function checkVideo(url) {
  const spinner = createSpinner('Comprobando URL...').start();
  try{
    await page.click('button[class="btn btn-primary rounded-0 menu4"]');
    await page.focus('#sid4 > div > form > div > input');
    await page.keyboard.type(url);
    await page.click('#sid4 > div > form > div > div > button');

    await page.waitForTimeout(1000);

    const found = (await page.content()).match('Not found video');
    if(found !== null)
      throw e;
    
    // await page.screenshot({path: 'ejecucion.png'});

    spinner.success({text: `URL correcta.`});
  } catch(e){
    spinner.error({text:`URL incorrecta.`});
    process.exit(1);
  }
}

const titulo = async() => {
  console.clear();
  const msg = `Tis Tos Bots © 2022\n Boosting views`;

  figlet(msg, (err,data) => {
    console.log(gradient.pastel.multiline(data));
  })

  await sleep(10);
}

const openImg = (fileName='captcha.png') => {
  child = childProcess.exec(fileName, (err, stdout, stderr) => {
    if(err !== null)
    console.log('Hubo un error al abrir la imagen.');
  })
}

const openPup = async () => {
  const spinner = createSpinner('Ejecutando navegador...').start();
  try{
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    page = await browser.newPage();
    await page.goto('https://zefoy.com', {waitUntil: 'networkidle2'});

    await page.screenshot({path: 'captcha.png'});

    const captchaImg = await page.$('img');
    await captchaImg.screenshot({path: 'captcha.png'});

    spinner.success({text: `Navegador abierto.`});
  } catch(e){
    console.error(e)
    spinner.error({text:`Hubo un fallo al abrir el navegador.`});
    process.exit(1);
  }
}

const loop = async (max=10000000) => {
  
  let numVisitas = '0';
  
  let mensaje = "Comenzando..";
  const empezando = chalkAnimation.karaoke(mensaje);

  let outVisitas;

  do{
    try{
      
      if(outVisitas == null)
        empezando.replace(mensaje += '.');

      await page.waitForSelector('#c2VuZC9mb2xsb3dlcnNfdGlrdG9V > div.row.text-light.d-flex.justify-content-center > div > form > button', {timeout: 15000});
      numVisitas = await page.evaluate(() => document.querySelector('#c2VuZC9mb2xsb3dlcnNfdGlrdG9V > div.row.text-light.d-flex.justify-content-center > div > form > button').textContent);
      await page.click('#c2VuZC9mb2xsb3dlcnNfdGlrdG9V > div.row.text-light.d-flex.justify-content-center > div > form > button');
      
      if(outVisitas == null){
        const now = new Date();
        console.log(`
          Hora inicio: ${chalk.blue(`[${now.getHours()}:${now.getMinutes()}]`)}
          Visitas a la hora de inicio: ${chalk.italic(chalk.yellow(`${numVisitas}`))}
        `);
        
        outVisitas = chalkAnimation.rainbow(" ");
        empezando.stop();
      }

      outVisitas.replace(`\tVisitas actuales: ${numVisitas}`);

    } catch(e){
      await page.click('#sid4 > div > form > div > div > button');
      await page.waitForTimeout(2000);
      // await page.screenshot({path: 'ejecucion.png'});
    }

  }while(parseInt(numVisitas.replace(/,/g, '')) < max);
}

let page, browser, child;

await titulo();
await openPup();
openImg();

const captcha = await askCaptcha();
await checkCaptcha(captcha);

const url = await askVideo();
await checkVideo(url);

const max = await askMax();
await loop(max);

process.exit(0);