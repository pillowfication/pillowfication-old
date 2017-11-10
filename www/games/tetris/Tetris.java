import java.applet.Applet;
import java.applet.AudioClip;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Image;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.image.BufferedImage;
import java.util.Random;

public class Tetris extends Applet implements Runnable, KeyListener
{
  public static class Piece
  {
    int x; int y; int p; int r;
    static final int map[][][][] = {
      {{{0,0,0,0},{0,1,1,0},{0,1,1,0},{0,0,0,0}},{{0,0,0,0},{0,1,1,0},{0,1,1,0},{0,0,0,0}},{{0,0,0,0},{0,1,1,0},{0,1,1,0},{0,0,0,0}},{{0,0,0,0},{0,1,1,0},{0,1,1,0},{0,0,0,0}}},
      {{{0,0,0,0},{1,1,1,1},{0,0,0,0},{0,0,0,0}},{{0,0,1,0},{0,0,1,0},{0,0,1,0},{0,0,1,0}},{{0,0,0,0},{1,1,1,1},{0,0,0,0},{0,0,0,0}},{{0,0,1,0},{0,0,1,0},{0,0,1,0},{0,0,1,0}}},
      {{{0,0,0,0},{0,0,1,1},{0,1,1,0},{0,0,0,0}},{{0,0,1,0},{0,0,1,1},{0,0,0,1},{0,0,0,0}},{{0,0,0,0},{0,0,1,1},{0,1,1,0},{0,0,0,0}},{{0,0,1,0},{0,0,1,1},{0,0,0,1},{0,0,0,0}}},
      {{{0,0,0,0},{0,1,1,0},{0,0,1,1},{0,0,0,0}},{{0,0,0,1},{0,0,1,1},{0,0,1,0},{0,0,0,0}},{{0,0,0,0},{0,1,1,0},{0,0,1,1},{0,0,0,0}},{{0,0,0,1},{0,0,1,1},{0,0,1,0},{0,0,0,0}}},
      {{{0,0,0,0},{0,1,1,1},{0,1,0,0},{0,0,0,0}},{{0,0,1,0},{0,0,1,0},{0,0,1,1},{0,0,0,0}},{{0,0,0,1},{0,1,1,1},{0,0,0,0},{0,0,0,0}},{{0,1,1,0},{0,0,1,0},{0,0,1,0},{0,0,0,0}}},
      {{{0,0,0,0},{0,1,1,1},{0,0,0,1},{0,0,0,0}},{{0,0,1,1},{0,0,1,0},{0,0,1,0},{0,0,0,0}},{{0,1,0,0},{0,1,1,1},{0,0,0,0},{0,0,0,0}},{{0,0,1,0},{0,0,1,0},{0,1,1,0},{0,0,0,0}}},
      {{{0,0,0,0},{0,1,1,1},{0,0,1,0},{0,0,0,0}},{{0,0,1,0},{0,0,1,1},{0,0,1,0},{0,0,0,0}},{{0,0,1,0},{0,1,1,1},{0,0,0,0},{0,0,0,0}},{{0,0,1,0},{0,1,1,0},{0,0,1,0},{0,0,0,0}}}};

    public Piece(int p)
    {
      set(p);
    }
    public void set(int p)
    {
      x = -20; y = Tetris.W*5-20;
      this.p = p;
      r = 1;
    }
    public void rot(int ro)
    {
      r += ro;
      if (r == 4) {r = 0;}
      if (r == -1) {r = 3;}
    }
  }

  Image os; Graphics bg;
  AudioClip ac;
  Image ti, gi;
  Image[] b = new Image[9];
  int t; int l = 0;
  static final int W = 1000;
  static final int H = 50;
  int[] ct = new int[7];
  Font[] ft = new Font[5];
  Random r = new Random();
  boolean d = false;

  int[] q = new int[7];
  int qV = 0;
  int[][] f = new int[H][W];
  Piece p;
  int m = 0;
  int ps = -1;
  boolean s = false;

  public void init()
  {
    Thread th = new Thread(this);
    th.start();
    setSize(W*10, H*10);
    addKeyListener(this);
    ac = getAudioClip(getCodeBase(), "TypeA.wav");
    ct[0] = KeyEvent.VK_RIGHT;
    ct[1] = KeyEvent.VK_LEFT;
    ct[2] = KeyEvent.VK_UP;
    ct[3] = 0;
    ct[4] = KeyEvent.VK_DOWN;
    ct[5] = KeyEvent.VK_SPACE;
    ct[6] = KeyEvent.VK_P;
    ft[0] = new Font(null, Font.PLAIN, 10);
    ft[1] = new Font(null, Font.BOLD, 10);
    ft[2] = new Font(null, Font.PLAIN, 30);
    ft[3] = new Font(null, Font.PLAIN, 20);
    ft[4] = new Font(null, Font.PLAIN, 15);
    bg = (os = createImage(W*10, H*10)).getGraphics();
    Graphics g;
    Color c = null;
    for (int i = 0; i < b.length-1; ++i)
    {
      g = (b[i] = createImage(10, 10)).getGraphics();
      switch (i)
      {
        case 0: c = new Color(200, 200, 0); break;
        case 1: c = new Color(0, 200, 200); break;
        case 2: c = new Color(0, 200, 0); break;
        case 3: c = new Color(200, 0, 0); break;
        case 4: c = new Color(230, 140, 0); break;
        case 5: c = new Color(0, 0, 200); break;
        case 6: c = new Color(200, 0, 200); break;
      }
      for (int j = 0; j < 4; ++j)
      {
        g.setColor(c);
        g.fillRect(j, j, 10-2*j, 10-2*j);
        int rv = c.getRed()+20;
        int gv = c.getGreen()+20;
        int bv = c.getBlue()+20;
        if (rv > 255) {rv = 255;}
        if (gv > 255) {gv = 255;}
        if (bv > 255) {bv = 255;}
        c = new Color(rv, gv, bv);
      }
    }
    g = (b[7] = createImage(10, 10)).getGraphics();
    g.setColor(new Color(0, 0, 0));
    g.drawRect(0, 0, 9, 9);
    g.setColor(new Color(25, 25, 25));
    g.drawRect(1, 1, 7, 7);
    g.setColor(new Color(35, 35, 35));
    g.fillRect(2, 1, 6, 8);
    g.fillRect(1, 2, 8, 6);
    g = (b[8] = createImage(10, 10)).getGraphics();
    g.setColor(new Color(120, 120, 120));
    g.drawRect(0, 0, 9, 9);
    g.setColor(new Color(75, 75, 75));
    g.drawRect(1, 1, 7, 7);
    g.setColor(new Color(60, 60, 60));
    g.fillRect(2, 1, 6, 8);
    g.fillRect(1, 2, 8, 6);
    for (int i = 0; i < f.length; ++i)
      for (int j = 0; j < f[i].length; ++j)
        f[i][j] = 7;
    BufferedImage ti;
    g = (ti = (BufferedImage) createImage(W, H)).getGraphics();
    g.setColor(Color.WHITE);
    g.fillRect(0, 0, 36, 7);
    g.setColor(Color.BLACK);
    g.setFont(ft[0]);
    g.drawString("TETRIS", W/2-18, 15);
    g.setFont(ft[1]);
    //g.drawString("BY PILLOW", W/2-27, 30);
    g = (this.ti = (BufferedImage) createImage(W*10, H*10)).getGraphics();
    for (int i = 0; i < ti.getHeight(); ++i)
      for (int j = 0; j < ti.getWidth(); ++j)
        if (ti.getRGB(j, i) != -1)
        {
          if (i < 20)
            g.drawImage(b[1], j*10, i*10, null);
          else
            g.drawImage(b[3], j*10, i*10, null);
        }
        else
          g.drawImage(b[7], j*10, i*10, null);
    g = (ti = (BufferedImage) createImage(W, H)).getGraphics();
    g.setColor(Color.WHITE);
    g.fillRect(0, 0, 36, 7);
    g.setColor(Color.BLACK);
    g.setFont(ft[1]);
    g.drawString("GAME OVER", W/2-32, 15);
    g = (gi = (BufferedImage) createImage(W*10, H*10)).getGraphics();
    for (int i = 0; i < ti.getHeight(); ++i)
      for (int j = 0; j < ti.getWidth(); ++j)
        if (ti.getRGB(j, i) != -1)
          g.drawImage(b[3], j*10, i*10, null);
        else
          g.drawImage(b[7], j*10, i*10, null);
    for (int i = 0; i < q.length; ++i)
      q[i] = i;
    rQ();
    p = new Piece(q[qV]);
    bg.setFont(ft[0]);
    bg.setColor(Color.WHITE);
    t = (int) System.currentTimeMillis()/500;
  }

  public void run()
  {
    while (true)
      repaint();
  }
  public void update(Graphics g)
  {
    paint(g);
  }

  public void paint(Graphics g)
  {
    switch (m)
    {
      case 0:
        bg.setColor(Color.BLACK);
        bg.fillRect(0, 0, W*10, H*10);
        bg.drawImage(ti, 0, 0, null);
        break;
      case 1:
        for (int i = 0; i < H; ++i)
          for (int j = 0; j < W; ++j)
            bg.drawImage(b[f[i][j]], j*10, i*10, null);
        int c = (int) System.currentTimeMillis()/500 - t;
        if (ps == -1 && c > 1)
        {
          if (!cC(p.x+10, p.y, Piece.map[p.p][p.r]))
          {
            if (!d)
              p.x += 10;
            t = (int) System.currentTimeMillis()/500;
          }
          else if (c > 2)
          {
            lock();
            t = (int) System.currentTimeMillis()/500;
          }
        }
        int x = p.x;
        while (!cC(x += 10, p.y, Piece.map[p.p][p.r]));
        x -= 10;
        for (int i = 0; i < 4; ++i)
          for (int j = 0; j < 4; ++j)
            if (Piece.map[p.p][p.r][i][j] == 1)
              bg.drawImage(b[8], p.y+i*10, x+j*10, null);
        for (int i = 0; i < 4; ++i)
          for (int j = 0; j < 4; ++j)
            if (Piece.map[p.p][p.r][i][j] == 1)
              bg.drawImage(b[p.p], p.y+i*10, p.x+j*10, null);
        bg.drawString("" + l, 2, 10);
        if (ps != -1)
        {
          bg.setColor(new Color(0, 0, 0, 200));
          bg.fillRect(0, 0, W*10, H*10);
          bg.setFont(ft[2]);
          bg.setColor(Color.WHITE);
          bg.drawString("PAUSED", W*5-60, 50);
          bg.setFont(ft[3]);
          bg.drawString("Controls", W*5-100, 120);
          if (!s)
            bg.drawString(">", W*5-118, 152+ps*20);
          else
            bg.drawString(">", W*5+32, 152+ps*20);
          bg.setFont(ft[4]);
          bg.drawString("Move Right", W*5-100, 150);
          bg.drawString("Move Left", W*5-100, 170);
          bg.drawString("Rotate Right", W*5-100, 190);
          bg.drawString("Rotate Left", W*5-100, 210);
          bg.drawString("Soft Drop", W*5-100, 230);
          bg.drawString("Hard Drop", W*5-100, 250);
          bg.drawString("Pause", W*5-100, 270);
          for (int i = 0; i < ct.length; ++i)
            if (ct[i] != 0)
              bg.drawString(KeyEvent.getKeyText(ct[i]), W*5+50, 150+i*20);
          bg.setFont(ft[0]);
        }
        break;
      case 2:
        bg.drawImage(gi, 0, 0, null);
        bg.setFont(ft[2]);
        bg.drawString("Lines: " + l, W*5-75, 270);
        break;
    }
    g.drawImage(os, 0, 0, this);
  }
  public void keyPressed(KeyEvent e)
  {
    int c = e.getKeyCode();
    switch (m)
    {
      case 0:
        if (c == KeyEvent.VK_ENTER)
        {
          m = 1;
          bg.setColor(Color.WHITE);
          ac.loop();
        }
        break;
      case 1:
        if (ps != -1)
          if (!s)
          {
            switch (c)
            {
              case KeyEvent.VK_UP: if (--ps < 0) {ps = 6;} break;
              case KeyEvent.VK_DOWN: if (++ps > 6) {ps = 0;} break;
              case KeyEvent.VK_ENTER: s = true; break;
            }
            if (c == ct[6])
              ps = -1;
          }
          else
          {
            ct[ps] = c;
            for (int i = 0; i < ct.length; i++)
              if (i != ps && ct[i] == c)
                ct[i] = 0;
            s = false;
          }
        else
        {
          int k = c;
          for (int i = 0; i < ct.length; ++i)
            if (k == ct[i])
            {
              k = i;
              break;
            }
          switch (k)
          {
            case 0: if (!cC(p.x, p.y+10, Piece.map[p.p][p.r])) {p.y += 10;} break;
            case 1: if (!cC(p.x, p.y-10, Piece.map[p.p][p.r])) {p.y -= 10;} break;
            case 2: rot(1); break;
            case 3: rot(-1); break;
            case 4: if (!cC(p.x+10, p.y, Piece.map[p.p][p.r])) {p.x += 10;} break;
            case 5: lock(); break;
            case 6: ps = 0; s = false; break;
          }
        }
        if (c == KeyEvent.VK_DOWN)
          d = true;
        break;
      case 2:
        if (c == KeyEvent.VK_ENTER)
        {
          m = 1;
          for (int i = 0; i < H; ++i)
            for (int j = 0; j < W; ++j)
              f[i][j] = 7;
          l = 0;
          rQ();
          bg.setColor(Color.WHITE);
          ac.loop();
        }
        break;
    }
  }
  public void keyReleased(KeyEvent e)
  {
    if (m == 1 && e.getKeyCode() == KeyEvent.VK_DOWN)
      d = false;
  }
  public void keyTyped(KeyEvent e) {}

  public void rQ()
  {
    for (int i = 0; i < q.length; ++i)
    {
      int c = r.nextInt(q.length - 1);
      if (c >= i)
        ++c;
      int t = q[i];
      q[i] = q[c];
      q[c] = t;
    }
  }
  public void rot(int r)
  {
    int ro = p.r + r;
    if (ro == 4) {ro = 0;}
    if (ro == -1) {ro = 3;}
    int[][]m = Piece.map[p.p][ro];
    if (cC(p.x, p.y, m))
    {
      if (!cC(p.x, p.y += 10, m))
        p.rot(r);
      else if (!cC(p.x, p.y -= 20, m))
        p.rot(r);
      else
        p.y += 10;
    }
    else
      p.rot(r);
  }
  public void lock()
  {
    while (!cC(p.x += 10, p.y, Piece.map[p.p][p.r]));
    p.x -= 10;
    for (int i = 0; i < 4; ++i)
      for (int j = 0; j < 4; ++j)
        if (Piece.map[p.p][p.r][i][j] == 1)
          if (p.x/10+j > 0)
            f[p.x/10+j][p.y/10+i] = p.p;
          else
          {
            m = 2;
            ac.stop();
          }
    l: for (int i = 0; i < H; ++i)
      for (int j = 0; j < W; ++j)
      {
        if (f[i][j] == 7)
          continue l;
        if (j == W-1)
        {
          for (int k = 0; k < i; ++k)
            f[i-k] = f[i-k-1];
          ++l;
        }
      }
    ++qV;
    if (qV == 7)
    {
      rQ();
      qV = 0;
    }
    p.set(q[qV]);
  }
  public boolean cC(int x, int y, int[][] m)
  {
    for (int i = 0; i < 4; ++i)
      for (int j = 0; j < 4; ++j)
        if (m[i][j] == 1)
        {
          int a = x+j*10;
          int b = y+i*10;
          if (a >= 0)
          {
            if (a >= H*10 || b < 0 || b >= W*10)
              return true;
            if (f[a/10][b/10] != 7)
              return true;
          }
        }
    return false;
  }
}
