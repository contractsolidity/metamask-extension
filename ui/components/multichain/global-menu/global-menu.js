import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CONNECTED_ROUTE,
  SETTINGS_ROUTE,
  DEFAULT_ROUTE,
  ///: BEGIN:ONLY_INCLUDE_IN(snaps)
  NOTIFICATIONS_ROUTE,
  SNAPS_ROUTE,
  ///: END:ONLY_INCLUDE_IN(snaps)
} from '../../../helpers/constants/routes';
import { lockMetamask } from '../../../store/actions';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  Box,
  IconName,
  ///: BEGIN:ONLY_INCLUDE_IN(snaps)
  Text,
  ///: END:ONLY_INCLUDE_IN(snaps)
} from '../../component-library';

import { Menu, MenuItem } from '../../ui/menu';
import { getEnvironmentType } from '../../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_FULLSCREEN } from '../../../../shared/constants/app';
import { SUPPORT_LINK } from '../../../../shared/lib/ui-utils';
///: BEGIN:ONLY_INCLUDE_IN(build-beta,build-flask)
import { SUPPORT_REQUEST_LINK } from '../../../helpers/constants/common';
///: END:ONLY_INCLUDE_IN

import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsContextProp,
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
import {
  getMmiPortfolioEnabled,
  getMmiPortfolioUrl,
} from '../../../selectors/institutional/selectors';
///: END:ONLY_INCLUDE_IN
import {
  ///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
  getMetaMetricsId,
  ///: END:ONLY_INCLUDE_IN(build-mmi)
  getSelectedAddress,
  getUnapprovedTransactions,
  ///: BEGIN:ONLY_INCLUDE_IN(snaps)
  getNotifySnaps,
  getUnreadNotificationsCount,
  getAnySnapUpdateAvailable,
  ///: END:ONLY_INCLUDE_IN
} from '../../../selectors';
///: BEGIN:ONLY_INCLUDE_IN(snaps)
import {
  AlignItems,
  BackgroundColor,
  BlockSize,
  BorderColor,
  Display,
  JustifyContent,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
///: END:ONLY_INCLUDE_IN
import { AccountDetailsMenuItem, ViewExplorerMenuItem } from '..';

const METRICS_LOCATION = 'Global Menu';

export const GlobalMenu = ({ closeMenu, anchorElement }) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);
  const history = useHistory();
  const address = useSelector(getSelectedAddress);
  const unapprovedTransactons = useSelector(getUnapprovedTransactions);

  ///: BEGIN:ONLY_INCLUDE_IN(snaps)
  const notifySnaps = useSelector(getNotifySnaps);
  ///: END:ONLY_INCLUDE_IN

  const hasUnapprovedTransactions =
    Object.keys(unapprovedTransactons).length > 0;

  ///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
  const metaMetricsId = useSelector(getMetaMetricsId);
  const mmiPortfolioUrl = useSelector(getMmiPortfolioUrl);
  const mmiPortfolioEnabled = useSelector(getMmiPortfolioEnabled);
  ///: END:ONLY_INCLUDE_IN

  ///: BEGIN:ONLY_INCLUDE_IN(snaps)
  const unreadNotificationsCount = useSelector(getUnreadNotificationsCount);
  const snapsUpdatesAvailable = useSelector(getAnySnapUpdateAvailable);
  ///: END:ONLY_INCLUDE_IN

  let supportText = t('support');
  let supportLink = SUPPORT_LINK;
  ///: BEGIN:ONLY_INCLUDE_IN(build-beta,build-flask)
  supportText = t('needHelpSubmitTicket');
  supportLink = SUPPORT_REQUEST_LINK;
  ///: END:ONLY_INCLUDE_IN

  return (
    <Menu anchorElement={anchorElement} onHide={closeMenu}>
      <AccountDetailsMenuItem
        metricsLocation={METRICS_LOCATION}
        closeMenu={closeMenu}
        address={address}
      />
      {/* <ViewExplorerMenuItem
        metricsLocation={METRICS_LOCATION}
        closeMenu={closeMenu}
        address={address}
      /> */}
      <Box
        borderColor={BorderColor.borderMuted}
        width={BlockSize.Full}
        style={{ height: '1px', borderBottomWidth: 0 }}
      ></Box>
      <MenuItem
        iconName={IconName.Connect}
        disabled={hasUnapprovedTransactions}
        onClick={() => {
          history.push(CONNECTED_ROUTE);
          trackEvent({
            event: MetaMetricsEventName.NavConnectedSitesOpened,
            category: MetaMetricsEventCategory.Navigation,
            properties: {
              location: METRICS_LOCATION,
            },
          });
          closeMenu();
        }}
        data-testid="global-menu-connected-sites"
      >
        {t('connectedSites')}
      </MenuItem>

      {
        ///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
        mmiPortfolioEnabled && (
          <MenuItem
            iconName={IconName.Diagram}
            onClick={() => {
              trackEvent({
                category: MetaMetricsEventCategory.Navigation,
                event: MetaMetricsEventName.MMIPortfolioButtonClicked,
              });
              window.open(
                `${mmiPortfolioUrl}?metametricsId=${metaMetricsId}`,
                '_blank',
              );
              closeMenu();
            }}
            data-testid="global-menu-mmi-portfolio"
          >
            {t('portfolioDashboard')}
          </MenuItem>
        )
        ///: END:ONLY_INCLUDE_IN
      }
      {getEnvironmentType() === ENVIRONMENT_TYPE_FULLSCREEN ? null : (
        <MenuItem
          iconName={IconName.Expand}
          onClick={() => {
            global.platform.openExtensionInBrowser();
            trackEvent({
              event: MetaMetricsEventName.AppWindowExpanded,
              category: MetaMetricsEventCategory.Navigation,
              properties: {
                location: METRICS_LOCATION,
              },
            });
            closeMenu();
          }}
          data-testid="global-menu-expand"
        >
          {t('expandView')}
        </MenuItem>
      )}
      {
        ///: BEGIN:ONLY_INCLUDE_IN(snaps)
        notifySnaps.length ? (
          <>
            <MenuItem
              iconName={IconName.Notification}
              onClick={() => {
                closeMenu();
                history.push(NOTIFICATIONS_ROUTE);
              }}
            >
              {t('notifications')}
              {unreadNotificationsCount > 0 && (
                <Text
                  as="span"
                  display={Display.InlineBlock}
                  justifyContent={JustifyContent.center}
                  alignItems={AlignItems.center}
                  backgroundColor={BackgroundColor.primaryDefault}
                  color={TextColor.primaryInverse}
                  padding={[0, 1, 0, 1]}
                  variant={TextVariant.bodyXs}
                  textAlign={TextAlign.Center}
                  data-testid="global-menu-notification-count"
                  style={{
                    borderRadius: '16px',
                    minWidth: '24px',
                  }}
                  marginInlineStart={2}
                >
                  {unreadNotificationsCount > 99
                    ? '99+'
                    : unreadNotificationsCount}
                </Text>
              )}
            </MenuItem>
          </>
        ) : null
        ///: END:ONLY_INCLUDE_IN(snaps)
      }
      {/* {
        ///: BEGIN:ONLY_INCLUDE_IN(snaps)
        <MenuItem
          iconName={IconName.Snaps}
          onClick={() => {
            history.push(SNAPS_ROUTE);
            closeMenu();
          }}
          showInfoDot={snapsUpdatesAvailable}
        >
          {t('snaps')}
        </MenuItem>
        ///: END:ONLY_INCLUDE_IN(snaps)
      } */}
      {/* <MenuItem
        iconName={IconName.MessageQuestion}
        onClick={() => {
          global.platform.openTab({ url: supportLink });
          trackEvent(
            {
              category: MetaMetricsEventCategory.Home,
              event: MetaMetricsEventName.SupportLinkClicked,
              properties: {
                url: supportLink,
                location: METRICS_LOCATION,
              },
            },
            {
              contextPropsIntoEventProperties: [
                MetaMetricsContextProp.PageTitle,
              ],
            },
          );
          closeMenu();
        }}
        data-testid="global-menu-support"
      >
        {supportText}
      </MenuItem> */}
      <MenuItem
        iconName={IconName.Setting}
        disabled={hasUnapprovedTransactions}
        onClick={() => {
          history.push(SETTINGS_ROUTE);
          trackEvent({
            category: MetaMetricsEventCategory.Navigation,
            event: MetaMetricsEventName.NavSettingsOpened,
            properties: {
              location: METRICS_LOCATION,
            },
          });
          closeMenu();
        }}
        data-testid="global-menu-settings"
      >
        {t('settings')}
      </MenuItem>
      <MenuItem
        iconName={IconName.Lock}
        onClick={() => {
          dispatch(lockMetamask());
          history.push(DEFAULT_ROUTE);
          trackEvent({
            category: MetaMetricsEventCategory.Navigation,
            event: MetaMetricsEventName.AppLocked,
            properties: {
              location: METRICS_LOCATION,
            },
          });
          closeMenu();
        }}
        data-testid="global-menu-lock"
      >
        {t('lockMetaMask')}
      </MenuItem>
    </Menu>
  );
};

GlobalMenu.propTypes = {
  /**
   * The element that the menu should display next to
   */
  anchorElement: PropTypes.instanceOf(window.Element),
  /**
   * Function that closes this menu
   */
  closeMenu: PropTypes.func.isRequired,
};
