import cloneDeep from 'lodash.clonedeep';
import merge from 'lodash.merge';

import {
  CLEAR_VIEWPORT,
  SET_ACTIVE_SPECIFIC_DATA,
  SET_SPECIFIC_DATA,
  SET_VIEWPORT,
  SET_VIEWPORT_ACTIVE,
  SET_VIEWPORT_LAYOUT,
  SET_VIEWPORT_LAYOUT_AND_DATA,
} from './../constants/ActionTypes.js';

const DEFAULT_STATE = {
  numRows: 1,
  numColumns: 1,
  activeViewportIndex: 0,
  layout: {
    viewports: [
      {
        // plugin: 'cornerstone',
      },
    ],
  },
  viewportSpecificData: {},
};

/**
 *  Take the new number of rows and columns, delete all not used viewport data and also set
 *  active viewport as default in case current one is not available anymore.
 *
 * @param {Object} action -
 * @param {Number} action.numRows -
 * @param {Number} action.numColumns -
 * @param {Object} currentViewportSpecificData -
 * @param {Number} currentActiveViewportIndex -
 * @returns
 */
const handleViewportDeletions = (action, currentViewportSpecificData, currentActiveViewportIndex) => {
  const numberOfViewports = action.numRows * action.numColumns;
  const viewportSpecificData = cloneDeep(currentViewportSpecificData);
  let activeViewportIndex = currentActiveViewportIndex;

  if (numberOfViewports < Object.keys(viewportSpecificData).length) {
    Object.keys(viewportSpecificData).forEach(key => {
      if (key >= numberOfViewports) {
        delete viewportSpecificData[key];
      }
    });

    if (!viewportSpecificData[currentActiveViewportIndex]) {
      activeViewportIndex = DEFAULT_STATE.activeViewportIndex;
    }
  }

  return {
    viewportSpecificData,
    activeViewportIndex,
  }
}

/**
 * The definition of a viewport action.
 *
 * @typedef {Object} ViewportAction
 * @property {string} type -
 * @property {Object} data -
 * @property {Object} layout -
 * @property {number} viewportIndex -
 * @property {Object} viewportSpecificData -
 */

/**
 * @param {Object} [state=DEFAULT_STATE] The current viewport state.
 * @param {ViewportAction} action A viewport action.
 */
const viewports = (state = DEFAULT_STATE, action) => {
  let useActiveViewport = false;

  switch (action.type) {
    /**
     * Sets the active viewport index.
     *
     * @return {Object} New state.
     */
    case SET_VIEWPORT_ACTIVE: {
      return { ...state, activeViewportIndex: action.viewportIndex };
    }

    /**
     * Sets viewport layout.
     *
     * @return {Object} New state.
     */
    case SET_VIEWPORT_LAYOUT: {
      const {
        viewportSpecificData,
        activeViewportIndex,
      } = handleViewportDeletions(action, state.viewportSpecificData, state.activeViewportIndex);

      return {
        ...state,
        numRows: action.numRows,
        numColumns: action.numColumns,
        layout: { viewports: [...action.viewports] },
        viewportSpecificData,
        activeViewportIndex,
      };
    }

    /**
     * Sets viewport layout and data.
     *
     * @return {Object} New state.
     */
    case SET_VIEWPORT_LAYOUT_AND_DATA: {
      const {
        viewportSpecificData,
        activeViewportIndex,
      } = handleViewportDeletions(action, action.viewportSpecificData, state.activeViewportIndex);

      return {
        ...state,
        numRows: action.numRows,
        numColumns: action.numColumns,
        layout: { viewports: [...action.viewports] },
        viewportSpecificData,
        activeViewportIndex,
      };
    }

    /**
     * Sets viewport specific data of active viewport.
     *
     * @return {Object} New state.
     */
    case SET_VIEWPORT: {
      const layout = cloneDeep(state.layout);

      let viewportSpecificData = cloneDeep(state.viewportSpecificData);
      viewportSpecificData[action.viewportIndex] = merge(
        {},
        viewportSpecificData[action.viewportIndex],
        action.viewportSpecificData
      );

      if (action.viewportSpecificData && action.viewportSpecificData.plugin) {
        layout.viewports[action.viewportIndex].plugin =
          action.viewportSpecificData.plugin;
      }

      return { ...state, layout, viewportSpecificData };
    }

    /**
     * Sets viewport specific data of active/any viewport.
     *
     * @return {Object} New state.
     */
    case SET_ACTIVE_SPECIFIC_DATA:
      useActiveViewport = true;
    // Allow fall-through
    // eslint-disable-next-line
    case SET_SPECIFIC_DATA: {
      const layout = cloneDeep(state.layout);
      const viewportIndex = useActiveViewport
        ? state.activeViewportIndex
        : action.viewportIndex;

      let viewportSpecificData = cloneDeep(state.viewportSpecificData);
      viewportSpecificData[viewportIndex] = {
        ...action.viewportSpecificData,
      };

      if (action.viewportSpecificData && action.viewportSpecificData.plugin) {
        layout.viewports[viewportIndex].plugin =
          action.viewportSpecificData.plugin;
      }

      return { ...state, layout, viewportSpecificData };
    }

    /**
     * Clears viewport specific data of any viewport.
     *
     * @return {Object} New state.
     */
    case CLEAR_VIEWPORT: {
      let viewportSpecificData = cloneDeep(state.viewportSpecificData);

      if (action.viewportIndex) {
        viewportSpecificData[action.viewportIndex] = {};
        return { ...state, viewportSpecificData };
      } else {
        return DEFAULT_STATE;
      }
    }

    /**
     * Returns the current application state.
     *
     * @return {Object} The current state.
     */
    default: {
      return state;
    }
  }
};

export default viewports;
