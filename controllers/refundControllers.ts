import { Request, Response } from "express";
import playwright from "playwright";
import refundSchema from "../schemas/refundSchema";
import {
  formatDateToSouthwestAirlines,
  parseNumberToSouthwestAirlines,
  toCapitalCase,
} from "../utils";

const SOUTH_WEST_REFUND_LINK =
  "https://support.southwest.com/helpcenter/s/voucher-request?clk=Redirect_DelayForm_VoucherRequest&clk=CSP_Form";

export const southwestAirlines = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { error, value } = refundSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: error.details.map((err: any) => ({
          field: err.context.label,
          message: err.message,
        })),
      });
    }

    const browser = await playwright.chromium.connectOverCDP(
      "wss://production-sfo.browserless.io?token=R3qrs0uAYrwFeO2c83126582824d815033dd6bd7e1"
    );

    // const browser = await chromium.launch({
    //   headless: false,
    // });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(SOUTH_WEST_REFUND_LINK);

    const cdp = await page.context().newCDPSession(page);

    // @ts-ignore
    cdp.on("Browserless.captchaFound", () => {
      res.json({
        status: "success",
        message: "Captcha detected!",
      });
    });

    await page.waitForTimeout(1000);

    await page.fill(
      'input[name="eventDate"]',
      formatDateToSouthwestAirlines(value.flight_event_date)
    );
    await page.fill('input[name="fNum"]', `${value.flight_number}`);
    await page.fill('input[name="cNum"]', value.confirmation_number);

    await page.fill('input[id="input-33"]', value.airport);
    await page.waitForTimeout(1000);
    await page.press('input[id="input-33"]', "Enter");

    await page.fill('input[id="input-42"]', value.origin_city);
    await page.waitForTimeout(1000);
    await page.press('input[id="input-42"]', "Enter");

    await page.fill('input[id="input-47"]', value.destination_city);
    await page.waitForTimeout(1000);
    await page.press('input[id="input-47"]', "Enter");

    await page.click("#combobox-button-75");
    await page.waitForSelector("lightning-base-combobox-item");
    await page.waitForTimeout(1000);
    await page.click(
      `lightning-base-combobox-item[data-value="${toCapitalCase(
        value.country
      )}"]`
    );

    await page.fill('input[name="fName"]', value.first_name);
    await page.fill('input[name="lName"]', value.last_name);
    await page.fill('input[name="email"]', value.email);
    await page.fill('input[name="cEmail"]', value.confirm_email);
    await page.fill(
      'input[name="pNum"]',
      `${parseNumberToSouthwestAirlines(value.phone_number)}`
    );
    await page.fill('input[name="sAdd"]', value.street_address);
    await page.fill('input[name="city"]', value.city);
    await page.fill('input[name="zCode"]', `${value.zip_code}`);

    await page.click("#combobox-button-69");
    await page.waitForSelector("lightning-base-combobox-item");
    await page.waitForTimeout(1000);
    await page.click(
      `lightning-base-combobox-item[data-value="${toCapitalCase(value.state)}"]`
    );

    await page.click(".hc-flight-entry-next");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "screenshot_1.png" });

    if (value.flight_cancellation) {
      await page
        .locator('label[for="checkbox-398"]')
        .locator(".slds-checkbox_faux")
        .click();
    }

    if (value.flight_delay) {
      await page
        .locator('label[for="checkbox-400"]')
        .locator(".slds-checkbox_faux")
        .click();
    }

    await page
      .locator('label[for="checkbox-402"]')
      .locator(".slds-checkbox_faux")
      .click();
    await page
      .locator('label[for="checkbox-404"]')
      .locator(".slds-checkbox_faux")
      .click();
    await page.fill('input[name="fName"]', "Anthony");
    await page.fill('input[name="lName"]', "Rassi");

    await page.click(".hc-expense-entry-submit");
    await page.waitForTimeout(1000);
    await page.click('.hc-confirmation-button:has-text("Confirm")');

    await page.waitForTimeout(2000);
    const element = await page.locator(".slds-p-bottom_small");

    if ((await element.count()) > 0) {
      const bodyContent = await element.innerHTML();
      console.log(bodyContent);

      res.json({
        status: "success",
        message: bodyContent,
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong. Form was not submitted.",
      });
    }

    await page.close();
    await browser.close();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong. Form was not submitted.",
      error,
    });
  }
};
