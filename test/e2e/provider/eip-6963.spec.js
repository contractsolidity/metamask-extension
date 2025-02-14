const { strict: assert } = require('assert');
const FixtureBuilder = require('../fixture-builder');
const {
  convertToHexValue,
  withFixtures,
  openDapp,
  unlockWallet,
} = require('../helpers');

// https://github.com/thenativeweb/uuidv4/blob/bdcf3a3138bef4fb7c51f389a170666f9012c478/lib/uuidv4.ts#L5
const UUID_V4_REGEX =
  /(?:^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$)|(?:^0{8}-0{4}-0{4}-0{4}-0{12}$)/u;

const SVG_DATA_URI_REGEX = /^data:image\/svg\+xml,/u;

describe('EIP-6963 Provider', function () {
  const ganacheOptions = {
    accounts: [
      {
        secretKey:
          '0x7C9529A67102755B7E6102D6D950AC5D5863C98713805CEC576B945B15B71EAC',
        balance: convertToHexValue(25000000000000000000),
      },
    ],
  };

  it('should respond to the request provider event', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        ganacheOptions,
        title: this.test.fullTitle(),
      },
      async ({ driver }) => {
        await unlockWallet(driver);

        await openDapp(driver);
        await driver.executeScript(`
          window.announceProviderEvents = []
          window.addEventListener(
            "eip6963:announceProvider",
            (event) => {
              window.announceProviderEvents.push(event)
            }
          );
          window.dispatchEvent(new Event("eip6963:requestProvider"));
        `);
        const announceProviderEvents = await driver.executeScript(`
          return window.announceProviderEvents.map(event => {
            return {
              type: event.type,
              detail: {
                ...event.detail,
                provider: Boolean(event.detail.provider)
              }
            }
          })
        `);

        assert.match(announceProviderEvents[0].detail.info.uuid, UUID_V4_REGEX);
        delete announceProviderEvents[0].detail.info.uuid;
        assert.match(
          announceProviderEvents[0].detail.info.icon,
          SVG_DATA_URI_REGEX,
        );
        delete announceProviderEvents[0].detail.info.icon;
        assert.deepStrictEqual(announceProviderEvents, [
          {
            type: 'eip6963:announceProvider',
            detail: {
              info: {
                name: 'NXN Wallet',
                rdns: 'io.metamask',
              },
              provider: true,
            },
          },
        ]);

        const request = JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 0,
        });
        const result = await driver.executeScript(`
          return window.announceProviderEvents[0].detail.provider.request(${request})
        `);

        assert.equal(result, '0x539');
      },
    );
  });
});
