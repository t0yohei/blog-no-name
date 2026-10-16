import { Buffer } from 'node:buffer';
import satori from 'satori';
import sharp from 'sharp';

export async function createOgImage(title: string, font: Buffer): Promise<Buffer> {
  for (let fontSize = 64; fontSize >= 20; fontSize -= 4) {
    let titleHeight = 0;
    const svg = await satori(
      {
        type: 'div',
        props: {
          lang: 'ja-JP',
          style: {
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: '#f1f5f9',
            color: '#252d33',
            fontFamily: 'BIZ UDPGothic',
            fontWeight: 700,
            borderTop: '12px solid #3b647f',
          },
          children: [
            {
              type: 'div',
              props: {
                style: { position: 'absolute', top: 64, left: 72, fontSize: 32, color: '#3b647f' },
                children: 'Blog No Name',
              },
            },
            {
              type: 'div',
              props: {
                id: 'title',
                style: {
                  position: 'absolute',
                  top: 158,
                  left: 72,
                  width: 1056,
                  fontSize,
                  lineHeight: 1.35,
                  wordBreak: 'break-all',
                },
                children: title,
              },
            },
            {
              type: 'div',
              props: {
                style: { position: 'absolute', bottom: 56, left: 72, fontSize: 24, color: '#586670' },
                children: 't0yohei / blog-no-name.com',
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [{ name: 'BIZ UDPGothic', data: font, weight: 700, style: 'normal' }],
        onNodeDetected: (node) => {
          if (node.props.id === 'title') titleHeight = node.height;
        },
      },
    );
    if (titleHeight <= 340) return sharp(Buffer.from(svg)).png().toBuffer();
  }
  throw new Error(`OGP title is too long to fit: ${title}`);
}
