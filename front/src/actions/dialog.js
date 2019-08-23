/*
 Cornetto

 Copyright (C) 2018–2019 ANSSI
 Contributors:
 2018–2019 Paul Fayoux paul.fayoux@ssi.gouv.fr
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 */
/**
 * This action call the route DIALOG_SET_OPEN of the reducer dialog
 * It use to open the dialog
 * @param {boolean} open a boolean that will indicate if the dialog should be hidden or visible
 */
export const setDialogOpen = open => ({
  type: 'DIALOG_SET_OPEN',
  open
})

/**
 * This action call the route DIALOG_SET_TITLE of the reducer dialog
 * It use to set the title of the dialog
 * @param {string} title the title of the dialog
 */
export const setDialogTitle = title => ({
  type: 'DIALOG_SET_TITLE',
  title
})

/**
 * This action call the route DIALOG_SET_TEXT of the reducer dialog
 * It use to set the text of the dialog
 * @param {string} text the text of the dialog
 */
export const setDialogText = text => ({
  type: 'DIALOG_SET_TEXT',
  text
})

/**
 * This action call the route DIALOG_SET_TYPE_ACTION of the reducer dialog
 * It use to set the type of action that the dialog will do on confirm
 * @param {string} typeAction the name of the type of action
 */
export const setDialogTypeAction = typeAction => ({
  type: 'DIALOG_SET_TYPE_ACTION',
  typeAction
})
