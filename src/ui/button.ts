/// <reference types="pixi.js" />

import { Part, Layer } from 'parts/part';
import { Colors, Alphas } from './config';
import { Renderer } from 'renderer';

export abstract class Button extends PIXI.Sprite {

  constructor() {
    super();
    this.cursor = 'pointer';
    this.interactive = true;
    this.anchor.set(0.5, 0.5);
    this._background = new PIXI.Graphics();
    this.addChild(this._background);
    this._updateState();
    this.onSizeChanged();
    this._bindHover();
  }
  protected _background:PIXI.Graphics;
  
  public get size():number { return(this._size); }
  public set size(v:number) {
    if (v === this._size) return;
    this._size = v;
    this.onSizeChanged();
    Renderer.needsUpdate();
  }
  private _size:number = 96;

  public get isToggled():boolean { return(this._isToggled); }
  public set isToggled(v:boolean) {
    if (v === this._isToggled) return;
    this._isToggled = v;
    this._drawDecorations();
    this._updateState();
  }
  private _isToggled:boolean = false;

  protected onSizeChanged():void {
    this._drawDecorations();
  }

  protected _bindHover():void {
    this.addListener('mouseover', (e) => {
      this._mouseOver = true;
      this._updateState();
    });
    this.addListener('mouseout', (e) => {
      this._mouseOver = false;
      this._updateState();
    });
    this.addListener('mousedown', (e) => {
      this._mouseDown = true;
      this._updateState();
    });
    this.addListener('mouseup', (e) => {
      this._mouseDown = false;
      this._updateState();
    });
  }

  protected _updateState():void {
    if ((this._mouseOver) && (this._mouseDown)) {
      this._background.alpha = Alphas.BUTTON_DOWN;
    }
    else if (this._mouseOver) {
      this._background.alpha = Alphas.BUTTON_OVER;
    }
    else this._background.alpha = Alphas.BUTTON_NORMAL;
    Renderer.needsUpdate();
  }
  private _mouseOver:boolean = false;
  private _mouseDown:boolean = false;

  protected _drawDecorations():void {
    const radius = 8; // pixels
    const s = this.size;
    const hs = Math.round(s * 0.5);
    if (this._background) {
      this._background.clear();
      this._background.beginFill(
        this.isToggled ? Colors.HIGHLIGHT : Colors.BUTTON_BACK);
      this._background.drawRoundedRect(- hs, - hs, s, s, radius);
      this._background.endFill();
    }
    Renderer.needsUpdate();
  }

}

export class PartButton extends Button {

  constructor(public readonly part:Part) {
    super();
    for (let i:number = Layer.BACK; i <= Layer.FRONT; i++) {
      const sprite = part.getSpriteForLayer(i);
      if (sprite) this.addChild(sprite);
    }
    this.onSizeChanged();
  }

  protected onSizeChanged():void {
    super.onSizeChanged();
    if (this.part) this.part.size = Math.floor(this.size * 0.5);
  }

}

export class SpriteButton extends Button {

  constructor(public readonly sprite:PIXI.Sprite) {
    super();
    if (sprite) {
      sprite.anchor.set(0.5, 0.5);
      this.addChild(sprite);
    }
    this.onSizeChanged();
  }

  protected onSizeChanged():void {
    super.onSizeChanged();
    if (this.sprite) {
      this.sprite.width = 
        this.sprite.height = 
          Math.floor(this.size * 0.75);
    }
  }

}